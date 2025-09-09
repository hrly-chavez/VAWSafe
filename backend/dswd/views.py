from shared_model.models import *
from rest_framework import generics
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

from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache


# Create your views here.
#Add @never_cache to sensitive view functions, or create middleware. Example for viewset:
@method_decorator(never_cache, name='dispatch')
class ViewVictim (generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimListSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    # permission_classes = [AllowAny] #gamita lang ni sya if ganahan mo makakita sa value kay tungod ni sa settingskatung JWTAuthentication 
    
class ViewDetail (generics.RetrieveAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    

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
            # simple search by name/Brgy/specialization/contact
            return qs.filter(
                (models.Q(of_fname__icontains=q) |
                 models.Q(of_lname__icontains=q) |
                 models.Q(of_brgy_assigned__icontains=q) |
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
            # simple search by name/Brgy/specialization/contact
            return qs.filter(
                (models.Q(of_fname__icontains=q) |
                 models.Q(of_lname__icontains=q) |
                 models.Q(of_brgy_assigned__icontains=q) |
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
   