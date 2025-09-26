from rest_framework import generics
import os, tempfile, traceback
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from deepface import DeepFace
from django.db.models import Q
from shared_model.models import *
from .serializers import *
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from shared_model.permissions import IsRole
from rest_framework.decorators import api_view, permission_classes

class victim_list(generics.ListAPIView):
    serializer_class = VictimListSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['Social Worker']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return Victim.objects.filter(
                incidents__sessions__assigned_official=user.official
            ).distinct()
        return Victim.objects.none()

class victim_detail(generics.RetrieveAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['Social Worker']

# retrieve all information related to case (Social Worker)
class VictimIncidentsView(generics.ListAPIView):
    serializer_class = IncidentInformationSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['Social Worker']

    def get_queryset(self):
        vic_id = self.kwargs.get("vic_id")
        return IncidentInformation.objects.filter(vic_id__pk=vic_id).order_by('incident_num')

    
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
    allowed_roles = ['Social Worker']

#========================================SESSIONS====================================================

class scheduled_session_lists(generics.ListAPIView):
    serializer_class = SocialWorkerSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return Session.objects.filter(
                assigned_official=user.official, 
                sess_status="Pending")
        return Session.objects.none()
    
class scheduled_session_detail(generics.RetrieveUpdateAPIView):  # View + Update
    serializer_class = SocialWorkerSessionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return Session.objects.filter(assigned_official=user.official)
        return Session.objects.none()

class SessionTypeListView(generics.ListAPIView):
    queryset = SessionType.objects.all()
    serializer_class = SessionTypeSerializer
    permission_classes = [IsAuthenticated]

    
#Session Start 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def social_worker_mapped_questions(request):
    """
    Get mapped questions for a given session number and one or more session types.
    Example: /api/social_worker/mapped-questions/?session_num=1&session_types=1,2
    """
    session_num = request.query_params.get("session_num")
    type_ids = request.query_params.get("session_types")

    if not session_num or not type_ids:
        return Response({"error": "session_num and session_types are required"}, status=400)

    type_ids = [int(t) for t in type_ids.split(",")]

    mappings = SessionTypeQuestion.objects.filter(
        session_number=session_num,
        session_type__id__in=type_ids
    ).select_related("question", "session_type")

    serializer = SocialWorkerSessionTypeQuestionSerializer(mappings, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request, sess_id):
    """
    Start a scheduled session assigned to the logged-in social worker.
    Hydrates mapped questions into SessionQuestions.
    """
    user = request.user
    try:
        session = Session.objects.get(pk=sess_id, assigned_official=user.official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you"}, status=404)

    # Mark session as ongoing
    session.sess_status = "Ongoing"
    session.sess_date_today = timezone.now()
    session.save()

    # Hydrate mapped questions
    type_ids = list(session.sess_type.values_list("id", flat=True))
    mappings = SessionTypeQuestion.objects.filter(
        session_number=session.sess_num,
        session_type__id__in=type_ids
    ).select_related("question")

    created = []
    for m in mappings:
        sq, _ = SessionQuestion.objects.get_or_create(
            session=session,
            question=m.question,
            defaults={"sq_is_required": False}
        )
        created.append(sq)

    #  serialize session detail (with victim + incident + etc.)
    session_data = SocialWorkerSessionDetailSerializer(session).data
    # attach hydrated questions separately
    session_data["questions"] = SocialWorkerSessionQuestionSerializer(created, many=True).data

    return Response(session_data, status=200)

@api_view(["POST"]) 
@permission_classes([IsAuthenticated])
def add_custom_question(request, sess_id):
    """
    Add one or more custom ad-hoc questions to a session.
    """
    user = request.user
    try:
        session = Session.objects.get(pk=sess_id, assigned_official=user.official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you"}, status=404)

    questions_data = request.data.get("questions", [])  # expect a list
    if not isinstance(questions_data, list) or len(questions_data) == 0:
        return Response({"error": "Questions must be a non-empty list"}, status=400)

    created = []
    for q in questions_data:
        text = q.get("sq_custom_text")
        answer_type = q.get("sq_custom_answer_type")
        if not text or not answer_type:
            continue  # skip invalid entries

        sq = SessionQuestion.objects.create(
            session=session,
            question=None,
            sq_custom_text=text,
            sq_custom_answer_type=answer_type,
            sq_is_required=q.get("sq_is_required", False)
        )
        created.append(sq)

    return Response(SocialWorkerSessionQuestionSerializer(created, many=True).data, status=201)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def finish_session(request, sess_id):
    """
    Save answers and mark session as Done.
    """
    user = request.user
    try:
        session = Session.objects.get(pk=sess_id, assigned_official=user.official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you"}, status=404)

    answers = request.data.get("answers", [])
    for ans in answers:
        try:
            sq = SessionQuestion.objects.get(pk=ans["sq_id"], session=session)
            sq.sq_value = ans.get("value")
            sq.sq_note = ans.get("note")
            sq.save()
        except SessionQuestion.DoesNotExist:
            continue
    #  Save session description (feedback)
    description = request.data.get("sess_description")
    if description is not None:
        session.sess_description = description
    #  Mark as Done
    session.sess_status = "Done"
    session.save()

    return Response({"message": "Session finished successfully!"}, status=200)


#case close
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def close_case(request, incident_id):
    """
    Close a case (incident) if it has 2 or more sessions.
    """
    try:
        incident = IncidentInformation.objects.get(pk=incident_id)
    except IncidentInformation.DoesNotExist:
        return Response({"error": "Incident not found"}, status=404)

    serializer = CloseCaseSerializer(
        incident, data={"incident_status": "Done"}, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({"message": "Case closed successfully!"}, status=200)

#schedule session
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def schedule_next_session(request):
    user = request.user

    if request.method == "GET":
        # same queryset logic
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            sessions = Session.objects.filter(
                assigned_official=user.official,
                sess_status__in=["Pending", "Ongoing"]
            ).order_by("-sess_next_sched")
        else:
            sessions = Session.objects.none()

        serializer = SocialWorkerSessionCRUDSerializer(sessions, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = SocialWorkerSessionCRUDSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_social_workers(request):
    
    q = request.query_params.get("q", "").strip()
    workers = Official.objects.filter(of_role="Social Worker")

    if q:
     workers = workers.filter(
        Q(of_fname__icontains=q) |
        Q(of_lname__icontains=q) |
        Q(of_m_initial__icontains=q)
    )

    workers = workers[:20]
    data = [
        {"of_id": w.of_id, "full_name": w.full_name}
        for w in workers
    ]
    return Response(data, status=200)

#=======================================CASES==============================================================

class SocialWorkerCaseList(generics.ListAPIView):
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return IncidentInformation.objects.filter(
                sessions__assigned_official=user.official,
                incident_status__in=["Pending", "Ongoing"]
            ).distinct()
        return IncidentInformation.objects.none()

