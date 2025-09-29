from shared_model.models import *
from rest_framework import generics, viewsets, permissions
import os, tempfile, traceback
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from deepface import DeepFace
from .serializers import *
from django.db.models import Prefetch
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from shared_model.permissions import IsRole
from django.contrib.auth.models import User
from rest_framework.decorators import action
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from PIL import Image

from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache


# Create your views here.
#Add @never_cache to sensitive view functions, or create middleware. Example for viewset:
@method_decorator(never_cache, name='dispatch')
# class ViewVictim (generics.ListAPIView):
#     queryset = Victim.objects.all()
#     serializer_class = VictimListSerializer
#     permission_classes = [IsAuthenticated, IsRole]
#     allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
#     # permission_classes = [AllowAny] #gamita lang ni sya if ganahan mo makakita sa value kay tungod ni sa settingskatung JWTAuthentication 
    
class ViewVictim(generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimListSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        queryset = super().get_queryset()

        vic_sex = self.request.query_params.get("vic_sex")
        province = self.request.query_params.get("province")
        municipality = self.request.query_params.get("municipality")
        barangay = self.request.query_params.get("barangay")

        if vic_sex and vic_sex != "All":
            queryset = queryset.filter(vic_sex=vic_sex)

        if province and province != "All":
            queryset = queryset.filter(province_id=province)

        if municipality and municipality != "All":
            queryset = queryset.filter(municipality_id=municipality)

        if barangay and barangay != "All":
            queryset = queryset.filter(barangay_id=barangay)

        return queryset

class ProvinceList(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

class MunicipalityList(generics.ListAPIView):
    serializer_class = MunicipalitySerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        province_id = self.request.query_params.get("province")
        queryset = Municipality.objects.all()
        if province_id:
            queryset = queryset.filter(province_id=province_id)
        return queryset

class BarangayList(generics.ListAPIView):
    serializer_class = BarangaySerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        municipality_id = self.request.query_params.get("municipality")
        queryset = Barangay.objects.all()
        if municipality_id:
            queryset = queryset.filter(municipality_id=municipality_id)
        return queryset

class ViewDetail (generics.RetrieveAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access

class VictimIncidentsView(generics.ListAPIView):
    serializer_class = IncidentInformationSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        vic_id = self.kwargs.get("vic_id")
        # If Victim's PK is vic_id, filter like this:
        return IncidentInformation.objects.filter(vic_id__pk=vic_id).order_by('incident_num')
    
class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = DeskOfficerSessionDetailSerializer
    lookup_field = "sess_id"
    allowed_roles = ["DSWD"]
    

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
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    

class ViewSocialWorker(generics.ListAPIView):
    serializer_class = SocialWorkerListSerializer

    def get_queryset(self):
        qs = (Official.objects
              .filter(of_role="Social Worker")
              .order_by("of_lname", "of_fname"))
        q = self.request.query_params.get("q")
        if q:
            return qs.filter(
                (models.Q(of_fname__icontains=q) |
                 models.Q(of_lname__icontains=q) |
                 models.Q(of_specialization__icontains=q) |
                 models.Q(of_contact__icontains=q))
            )
        return qs

    def list(self, request, *args, **kwargs):
        # ensure absolute image URLs
        self.serializer_class.context = {"request": request}
        return super().list(request, *args, **kwargs)
    
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
    
class ViewSocialWorkerDetail(generics.RetrieveAPIView):
    serializer_class = SocialWorkerDetailSerializer
    lookup_field = "of_id"

    def get_queryset(self):
        return (
            Official.objects
            .filter(of_role="Social Worker")
            .prefetch_related(
                "face_samples",
                Prefetch("handled_incidents", queryset=IncidentInformation.objects.select_related("vic_id").order_by("-incident_date")),
                Prefetch("sessions_handled", queryset=Session.objects.select_related("incident_id").order_by("-sess_date_today")),
            )
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})  # absolute media URLs
        return ctx
    
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
    
class ViewVAWDeskOfficer(generics.ListAPIView):
    serializer_class = VAWDeskOfficerListSerializer

    def get_queryset(self):
        qs = (Official.objects
              .filter(of_role="VAWDesk")
              .order_by("of_lname", "of_fname"))
        q = self.request.query_params.get("q")
        if q:
            return qs.filter(
                (models.Q(of_fname__icontains=q) |
                 models.Q(of_lname__icontains=q) |
                 models.Q(of_specialization__icontains=q) |
                 models.Q(of_contact__icontains=q))
            )
        return qs

    def list(self, request, *args, **kwargs):
        # ensure absolute image URLs
        self.serializer_class.context = {"request": request}
        return super().list(request, *args, **kwargs)
    
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
class ViewVAWDeskOfficerDetail(generics.RetrieveAPIView):
    serializer_class = VAWDeskOfficerListSerializer
    lookup_field = "of_id"

    def get_queryset(self):
        return (
            Official.objects
            .filter(of_role="VAWDesk")
            .prefetch_related(
                "face_samples"
            )
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})  # absolute media URLs
        return ctx
    
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
class OfficialViewSet(ModelViewSet):
   queryset = Official.objects.all()
   serializer_class = OfficialSerializer
   permission_classes = [AllowAny]  # 👈 disables auth only for this view

   def get_queryset(self):
        return Official.objects.filter(
            of_role__in=["Social Worker", "VAWDesk"]
        ).exclude(
            of_role="VAWDesk", status="pending"
        )
    
class PendingOfficials(viewsets.ModelViewSet):
    queryset = Official.objects.all()
    serializer_class = OfficialSerializer

    def get_queryset(self):
        return Official.objects.filter(status="pending", of_role__in = ["VAWDesk"])

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        Approve a VAWDesk Officer:
        - Generate username and password
        - Create Django User
        - Save face samples if uploaded
        - Email credentials
        """
        try:
            official = self.get_object()
            if official.status != "pending":
                return Response({"error": "This official is not pending approval."},
                                status=status.HTTP_400_BAD_REQUEST)

            # ✅ Generate username
            fname = official.of_fname.strip().lower()
            lname = official.of_lname.strip().lower()
            base_username = f"{fname}{lname}".replace(" ", "")
            username = base_username or get_random_string(8)

            # Ensure unique username
            counter = 0
            while User.objects.filter(username=username).exists():
                counter += 1
                username = f"{base_username}{counter}"

            # ✅ Generate secure password
            generated_password = get_random_string(length=12)

            # ✅ Create user (password automatically hashed)
            user = User.objects.create_user(username=username, password=generated_password)

            # ✅ Link to Official
            official.user = user
            official.status = "approved"
            official.save()

            # ✅ Save embeddings if face photos exist
            photo_files = official.of_photos.all() if hasattr(official, "of_photos") else []
            created_count = 0
            for file in photo_files:
                try:
                    temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                    image = Image.open(file).convert("RGB")
                    image.save(temp_image, format="JPEG")
                    temp_image.flush()
                    temp_image.close()

                    embeddings = DeepFace.represent(
                        img_path=temp_image.name,
                        model_name="ArcFace",
                        enforce_detection=True
                    )

                    if isinstance(embeddings, list) and "embedding" in embeddings[0]:
                        embedding_vector = embeddings[0]["embedding"]
                    elif isinstance(embeddings, dict) and "embedding" in embeddings:
                        embedding_vector = embeddings["embedding"]
                    else:
                        raise ValueError("Unexpected DeepFace format.")

                    OfficialFaceSample.objects.create(
                        official=official,
                        photo=file,
                        embedding=embedding_vector
                    )
                    created_count += 1

                except Exception as e:
                    traceback.print_exc()
                finally:
                    if os.path.exists(temp_image.name):
                        os.remove(temp_image.name)

            # ✅ Send email notification
            send_mail(
                subject="VAWDesk Account Approved",
                message=(
                    f"Dear {official.of_fname},\n\n"
                    f"Your VAWDesk account has been approved by DSWD.\n\n"
                    f"Username: {username}\n"
                    f"Password: {generated_password}\n\n"
                    f"Please log in and change your password immediately."
                ),
                from_email="no-reply@vawsafe.ph",
                recipient_list=[official.of_email],  # 👈 assumes you have of_email field
                fail_silently=False,
            )

            return Response({
                "message": f"VAWDesk Officer approved. {created_count} face sample(s) saved.",
                "official_id": official.of_id,
                "username": username,
                "password": generated_password,  # ⚠️ only returned in API, consider hiding this
                "role": official.of_role
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """
        Reject an applicant:
        - Send rejection email with reason
        - Delete their Official record
        """
        try:
            official = self.get_object()

            if official.status != "pending":
                return Response({"error": "This official is not pending approval."},
                                status=status.HTTP_400_BAD_REQUEST)

            # ✅ Get reason from request
            reason = request.data.get("reason", "No reason provided.")

            # ✅ Send rejection email
            send_mail(
                subject="VAWDesk Application Status",
                message=(
                    f"Dear {official.of_fname},\n\n"
                    "We regret to inform you that your application as VAWDesk Officer "
                    "has been rejected by DSWD.\n\n"
                    f"Reason: {reason}\n\n"
                    "Thank you for your interest."
                ),
                from_email="no-reply@vawsafe.ph",
                recipient_list=[official.of_email],
                fail_silently=False,
            )

            # ✅ Delete record
            official.delete()

            return Response({
                "message": "Official rejected and record deleted.",
                "reason": reason
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class ServicesListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicesSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        queryset = Services.objects.all()
        category = self.request.query_params.get("category", None)

        # only filter if not "All" and not empty
        if category and category != "All":
            queryset = queryset.filter(category=category)
        return queryset
