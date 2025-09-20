import tempfile, os, traceback, json
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from shared_model.permissions import IsRole
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action

from deepface import DeepFace
from PIL import Image
from django.db import transaction

from shared_model.models import *
from .serializers import *

class ProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"])
    def municipalities(self, request, pk=None):
        municipalities = Municipality.objects.filter(province_id=pk)
        return Response(MunicipalitySerializer(municipalities, many=True).data)


class MunicipalityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"])
    def barangays(self, request, pk=None):
        barangays = Barangay.objects.filter(municipality_id=pk)
        return Response(BarangaySerializer(barangays, many=True).data)


# victim functions
class ViewVictim (generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimListSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['VAWDesk']
    
class ViewDetail (generics.RetrieveAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['VAWDesk']

class search_victim_facial(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("frame")

        if not uploaded_file:
            return Response({"error": "No image uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Save temp image
        try:
            temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            temp_image.write(uploaded_file.read())
            temp_image.flush()
            temp_image.close()
            chosen_frame = temp_image.name
        except Exception as e:
            return Response({"error": f"Failed to save uploaded image: {str(e)}"}, status=400)

        # Step 1: Compare with all VictimFaceSamples
        best_match = None
        best_sample = None
        lowest_distance = float("inf")

        try:
            for sample in VictimFaceSample.objects.select_related("victim"):
                try:
                    result = DeepFace.verify(
                        img1_path=chosen_frame,
                        img2_path=sample.photo.path,
                        model_name="ArcFace",
                        enforce_detection=True
                    )

                    victim = sample.victim
                    print(f"[DEBUG] Compared with {victim.vic_first_name} {victim.vic_last_name}, distance: {result['distance']:.4f}, verified: {result['verified']}")

                    if result["verified"] and result["distance"] < lowest_distance:
                        lowest_distance = result["distance"]
                        best_match = victim
                        best_sample = sample

                except Exception as ve:
                    print(f"[WARN] Skipping {sample.victim.vic_first_name} {sample.victim.vic_last_name} due to error: {str(ve)}")
                    continue

            if best_match:
                serializer = VictimDetailSerializer(best_match, context={"request": request})
                return Response({
                    "match": True,
                    "victim_id": best_match.vic_id,
                    "victim_data": serializer.data
                }, status=status.HTTP_200_OK)

            # No match found
            return Response({
                "match": False,
                "message": "The Victim is not yet registered."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            traceback.print_exc()
            return Response({
                "match": False,
                "error": str(e),
                "suggestion": "Something went wrong with face verification."
            }, status=status.HTTP_400_BAD_REQUEST)

        finally:
            if chosen_frame and os.path.exists(chosen_frame):
                os.remove(chosen_frame)

    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['VAWDesk']

# retrieve all information related to case
class VictimIncidentsView(generics.ListAPIView):
    serializer_class = IncidentInformationSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['VAWDesk']

    def get_queryset(self):
        vic_id = self.kwargs.get("vic_id")
        # If Victim's PK is vic_id, filter like this:
        return IncidentInformation.objects.filter(vic_id__pk=vic_id).order_by('incident_num')

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic
def register_victim(request):
    """
    Unified endpoint:
    - Creates Victim (+ profile photo)
    - Stores victim face samples + embeddings (best-effort)
    - Optionally creates CaseReport, IncidentInformation, Perpetrator
    """

    def parse_json_field(key):
        raw = request.data.get(key)
        if raw is None or raw == "":
            return None
        if isinstance(raw, (dict, list)):
            return raw
        if isinstance(raw, str):
            try:
                return json.loads(raw)
            except Exception:
                raise ValueError(f"Invalid JSON in '{key}'")
        return None

    def to_bool(v):
        if isinstance(v, bool):
            return v
        # normalize common truthy/falsey string/int values from forms
        if v in (1, "1", "true", "True", "on", "yes", "Yes", "y", "Y"):
            return True
        if v in (0, "0", "false", "False", "off", "no", "No", "n", "N", "", None):
            return False
        return v  # leave as-is; serializer will complain if truly invalid

    try:
        print(f"[register_victim] hit: {request.content_type}")

        # 1) Victim
        victim_data = parse_json_field("victim") or {}
        v_ser = VictimSerializer(data=victim_data)
        if not v_ser.is_valid():
            print("[victim] errors:", v_ser.errors)
            return Response({"success": False, "errors": v_ser.errors},
                            status=status.HTTP_400_BAD_REQUEST)
        victim = v_ser.save()  # PK available via victim.pk or victim.vic_id

        # 2) Photos + Face Samples
        photo_files = request.FILES.getlist("photos")
        if photo_files:
            victim.vic_photo = photo_files[0]
            victim.save()

            created_count = 0
            for idx, file in enumerate(photo_files, start=1):
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                try:
                    Image.open(file).convert("RGB").save(tmp, format="JPEG")
                    tmp.flush(); tmp.close()

                    embedding_vector = None
                    try:
                        
                        reps = DeepFace.represent(
                        img_path=tmp.name,
                        model_name="ArcFace",
                        enforce_detection=True
                    )
                        if isinstance(reps, list) and reps and isinstance(reps[0], dict):
                            embedding_vector = reps[0].get("embedding")
                        elif isinstance(reps, dict):
                            embedding_vector = reps.get("embedding")
                    except Exception as face_err:
                        print(f"[EMBEDDING] Failed on photo #{idx}: {face_err}")

                    VictimFaceSample.objects.create(
                        victim=victim, photo=file, embedding=embedding_vector
                    )
                    created_count += 1

                except Exception:
                    print(f"[PHOTO] unexpected error on photo #{idx}")
                    traceback.print_exc()
                finally:
                    if os.path.exists(tmp.name):
                        os.remove(tmp.name)

            if created_count == 0:
                transaction.set_rollback(True)
                return Response({"success": False, "error": "No photos could be saved."},
                                status=status.HTTP_400_BAD_REQUEST)

        # 3) CaseReport (optional)
        case_report = None
        case_report_data = parse_json_field("case_report")
        if case_report_data:
            c_ser = CaseReportSerializer(data=case_report_data)
            if not c_ser.is_valid():
                print("[case_report] errors:", c_ser.errors)
                return Response({"success": False, "errors": c_ser.errors},
                                status=status.HTTP_400_BAD_REQUEST)
            case_report = c_ser.save(victim=victim)

        # 4) Perpetrator (optional)
        perpetrator = None
        perpetrator_data = parse_json_field("perpetrator")
        if perpetrator_data:
            p_ser = PerpetratorSerializer(data=perpetrator_data)
            if not p_ser.is_valid():
                print("[perpetrator] errors:", p_ser.errors)
                return Response({"success": False, "errors": p_ser.errors},
                                status=status.HTTP_400_BAD_REQUEST)
            perpetrator = p_ser.save()

        # 5) IncidentInformation (optional)
        incident = None
        incident_data = parse_json_field("incident")
        if incident_data:
            # FK field name on your model is vic_id (not "victim")
            incident_data["vic_id"] = victim.pk  # or victim.vic_id

            if perpetrator:
                incident_data["perp_id"] = perpetrator.pk
       
            for key in ("is_via_electronic_means", "is_conflict_area", "is_calamity_area"):
                if key in incident_data:
                    incident_data[key] = to_bool(incident_data[key])

            i_ser = IncidentInformationSerializer(data=incident_data)
            if not i_ser.is_valid():
                print("[incident] errors:", i_ser.errors)
                return Response({"success": False, "errors": i_ser.errors},
                                status=status.HTTP_400_BAD_REQUEST)
            incident = i_ser.save()

        # 5.5) Evidences (optional)
        evidence_files = request.FILES.getlist("evidences")  # matches frontend FormData key
        if incident and evidence_files:
            for file in evidence_files:
                Evidence.objects.create(
                    incident=incident,
                    file=file
                )

        

        return Response({
            "success": True,
            "victim": VictimSerializer(victim).data,
            "case_report": CaseReportSerializer(case_report).data if case_report else None,
            "incident": IncidentInformationSerializer(incident).data if incident else None,
            "perpetrator": PerpetratorSerializer(perpetrator).data if perpetrator else None,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        traceback.print_exc()
        transaction.set_rollback(True)
        return Response({"success": False, "error": str(e)},
                        status=status.HTTP_400_BAD_REQUEST)

#=======================================================================SESSION FUNCTIONS
class SessionListCreateView(generics.ListCreateAPIView):
    serializer_class = SessionSerializer

    def get_queryset(self):
        # Only return sessions that are Pending or Ongoing
        return Session.objects.filter(sess_status__in=['Pending', 'Ongoing']).order_by('-sess_next_sched')

class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    lookup_field = "sess_id"

@api_view(["POST"])
def create_session(request):
    """
    API for scheduling or starting a session.
    """
    data = request.data.copy()
    started_now = data.pop("started_now", False)

    serializer = SessionSerializer(data=data)
    if serializer.is_valid():
        if started_now:
            session = serializer.save(
                sess_status="Ongoing",
                sess_date_today=timezone.now()
            )
        else:
            session = serializer.save(sess_status="Pending")
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def list_social_workers(request):
    workers = Official.objects.filter(of_role="Social Worker")
    data = [
        {"of_id": w.of_id, "full_name": w.full_name}
        for w in workers
    ]
    return Response(data)

@api_view(["GET"])
def list_session_types(request):
    types = SessionType.objects.all()
    serializer = SessionTypeSerializer(types, many=True)
    return Response(serializer.data)
#=======================================================================





# Approve and Reject Official
# @api_view(["POST"])
# def approve_official(request):
#     of_id = request.data.get("of_id")
#     try:
#         official = Official.objects.get(pk=of_id)
#         official.status = "approved"
#         official.save()
#         return Response({"success": True, "message": "Official approved."}, status=status.HTTP_200_OK)
#     except Official.DoesNotExist:
#         return Response({"success": False, "error": "Official not found."}, status=status.HTTP_404_NOT_FOUND)


# @api_view(["POST"])
# def reject_official(request):
#     of_id = request.data.get("of_id")
#     try:
#         official = Official.objects.get(pk=of_id)
#         official.status = "rejected"
#         official.save()
#         return Response({"success": True, "message": "Official rejected."}, status=status.HTTP_200_OK)
#     except Official.DoesNotExist:
#         return Response({"success": False, "error": "Official not found."}, status=status.HTTP_404_NOT_FOUND)


# Account Management
class OfficialViewSet(ModelViewSet):
   queryset = Official.objects.all()
   serializer_class = OfficialSerializer
   permission_classes = [AllowAny]  # 👈 disables auth only for this view

   def get_queryset(self):
        return Official.objects.filter(of_role="Social Worker")

# View field for Social Worker Accounts
class SocialWorkerListView(generics.ListAPIView):
    permission_classes = [AllowAny]  # 👈 make public
    serializer_class = OfficialSerializer

    def get_queryset(self):
        return Official.objects.filter(of_role__iexact="Social Worker").order_by("-of_id")

class AssignBarangayView(generics.UpdateAPIView):
    permission_classes = [AllowAny]  # 👈 make public
    serializer_class = OfficialSerializer
    queryset = Official.objects.filter(of_role__iexact="Social Worker")
    lookup_field = "of_id"
