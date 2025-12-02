from shared_model.models import *
from rest_framework import generics, viewsets, permissions
import os, tempfile, traceback
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from deepface import DeepFace
from .serializers import *
from django.db.models import Prefetch, Count
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from shared_model.permissions import IsRole
from django.contrib.auth.models import User
from rest_framework.decorators import action, api_view, permission_classes
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from PIL import Image
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models.fields.files import FieldFile
from datetime import date, datetime, timedelta
from calendar import month_name
from collections import Counter
import json
from dswd.utils.logging import log_change

#change password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from cryptography.fernet import Fernet
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

#Add @never_cache to sensitive view functions, or create middleware. Example for viewset:
@method_decorator(never_cache, name='dispatch')
# class ViewVictim (generics.ListAPIView):
#     queryset = Victim.objects.all()
#     serializer_class = VictimListSerializer
#     permission_classes = [IsAuthenticated, IsRole]
#     allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
#     # permission_classes = [AllowAny] #gamita lang ni sya if ganahan mo makakita sa value kay tungod ni sa settingskatung JWTAuthentication 

#===========================================VAWC Victim==========================================
class ViewVictim(generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimListSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        # Get query parameters
        province = self.request.query_params.get("province")
        municipality = self.request.query_params.get("municipality")
        barangay = self.request.query_params.get("barangay")
        age_min = self.request.query_params.get("age_min")  # Min age filter
        age_max = self.request.query_params.get("age_max")  # Max age filter

        # Filter by location
        queryset = Victim.objects.all()
        
        if province and province != "All":
            queryset = queryset.filter(province_id=province)

        if municipality and municipality != "All":
            queryset = queryset.filter(municipality_id=municipality)

        if barangay and barangay != "All":
            queryset = queryset.filter(barangay_id=barangay)

        # Filter by age range (if provided) using decrypted birth date
        filtered_victims = []
        if age_min or age_max:
            today = date.today()
            for victim in queryset:
                # Decrypt birth date
                decrypted_birth_date = victim.vic_birth_date

                if decrypted_birth_date:
                    age = today.year - decrypted_birth_date.year - ((today.month, today.day) < (decrypted_birth_date.month, decrypted_birth_date.day))

                    # Apply age filter
                    if age_min and age < int(age_min):
                        continue
                    if age_max and age > int(age_max):
                        continue
                    
                    # Add the victim to the filtered list if it passes the age check
                    filtered_victims.append(victim)
            queryset = filtered_victims

        return queryset

#===========================================Address(Used in Services)==========================================
class ProvinceList(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    # permission_classes = [IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]

# class MunicipalityList(generics.ListAPIView):
#     serializer_class = MunicipalitySerializer
#     # permission_classes = [IsAuthenticated, IsRole]
#     # allowed_roles = ['DSWD']
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         province_id = self.request.query_params.get("province")
#         queryset = Municipality.objects.all()
#         if province_id:
#             queryset = queryset.filter(province_id=province_id)
#         return queryset

# class BarangayList(generics.ListAPIView):
#     serializer_class = BarangaySerializer
#     # permission_classes = [IsAuthenticated, IsRole]
#     # allowed_roles = ['DSWD']
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         municipality_id = self.request.query_params.get("municipality")
#         queryset = Barangay.objects.all()
#         if municipality_id:
#             queryset = queryset.filter(municipality_id=municipality_id)
#         return queryset

class MunicipalityList(generics.ListAPIView):
    serializer_class = MunicipalitySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        province_id = self.request.query_params.get("province")
        queryset = Municipality.objects.all()

        # Check if province_id is passed as an ID or a name
        if province_id:
            # Try filtering by ID first
            try:
                province_id = int(province_id)  # Try converting to an integer
                queryset = queryset.filter(province_id=province_id)
            except ValueError:
                # If it fails, assume it's a province name and filter by name
                queryset = queryset.filter(province__name=province_id)

        return queryset
    
class BarangayList(generics.ListAPIView):
    serializer_class = BarangaySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        municipality_id = self.request.query_params.get("municipality")
        queryset = Barangay.objects.all()

        # Check if municipality_id is passed as an ID or a name
        if municipality_id:
            try:
                municipality_id = int(municipality_id)  # Try converting to an integer
                queryset = queryset.filter(municipality_id=municipality_id)
            except ValueError:
                # If it fails, assume it's a municipality name and filter by name
                queryset = queryset.filter(municipality__name=municipality_id)

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
    
class SessionDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve full session details for DSWD Admin.
    Includes all linked services and questions.
    Read-only.
    """
    serializer_class = DSWDSessionDetailSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["DSWD"]
    lookup_field = "sess_id"

    def get_queryset(self):
        return (
            Session.objects
            .all()
            .select_related("assigned_official", "incident_id")
            .prefetch_related(
                "sess_type",
                "session_questions",
                "services_given__serv_id__category",
                "services_given__of_id"
            )
        )
  
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
    
# class ViewSocialWorker(generics.ListAPIView):
#     serializer_class = SocialWorkerListSerializer

#     def get_queryset(self):
#         qs = (Official.objects
#               .filter(of_role="Social Worker")
#               .order_by("of_lname", "of_fname"))
#         q = self.request.query_params.get("q")
#         if q:
#             return qs.filter(
#                 (models.Q(of_fname__icontains=q) |
#                  models.Q(of_lname__icontains=q) |
#                  models.Q(of_specialization__icontains=q) |
#                  models.Q(of_contact__icontains=q))
#             )
#         return qs

#     def list(self, request, *args, **kwargs):
#         # ensure absolute image URLs
#         self.serializer_class.context = {"request": request}
#         return super().list(request, *args, **kwargs)
    
#     permission_classes = [IsAuthenticated, IsRole]
#     allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
# class ViewSocialWorkerDetail(generics.RetrieveAPIView):
#     serializer_class = SocialWorkerDetailSerializer
#     lookup_field = "of_id"

#     def get_queryset(self):
#         return (
#             Official.objects
#             .filter(of_role="Social Worker")
#             .prefetch_related(
#                 "face_samples",
#                 Prefetch("handled_incidents", queryset=IncidentInformation.objects.select_related("vic_id").order_by("-incident_date")),
#                 Prefetch("sessions_handled", queryset=Session.objects.select_related("incident_id").order_by("-sess_date_today")),
#             )
#         )

#     def get_serializer_context(self):
#         ctx = super().get_serializer_context()
#         ctx.update({"request": self.request})  # absolute media URLs
#         return ctx
    
#     permission_classes = [IsAuthenticated, IsRole]
#     allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
     
# class ViewVAWDeskOfficer(generics.ListAPIView):
#     serializer_class = VAWDeskOfficerListSerializer

#     def get_queryset(self):
#         qs = (Official.objects
#               .filter(of_role="VAWDesk")
#               .order_by("of_lname", "of_fname"))
#         q = self.request.query_params.get("q")
#         if q:
#             return qs.filter(
#                 (models.Q(of_fname__icontains=q) |
#                  models.Q(of_lname__icontains=q) |
#                  models.Q(of_specialization__icontains=q) |
#                  models.Q(of_contact__icontains=q))
#             )
#         return qs

#     def list(self, request, *args, **kwargs):
#         # ensure absolute image URLs
#         self.serializer_class.context = {"request": request}
#         return super().list(request, *args, **kwargs)
    
#     permission_classes = [IsAuthenticated, IsRole]
#     allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
# class ViewVAWDeskOfficerDetail(generics.RetrieveAPIView):
#     serializer_class = VAWDeskOfficerListSerializer
#     lookup_field = "of_id"

#     def get_queryset(self):
#         return (
#             Official.objects
#             .filter(of_role="VAWDesk")
#             .prefetch_related(
#                 "face_samples"
#             )
#         )

#     def get_serializer_context(self):
#         ctx = super().get_serializer_context()
#         ctx.update({"request": self.request})  # absolute media URLs
#         return ctx
    
#     permission_classes = [IsAuthenticated, IsRole]
#     allowed_roles = ['DSWD']  # only users with Official.of_role == 'DSWD' can access
    
#====================================QUESTIONS========================================

class QuestionListCreate(generics.ListCreateAPIView): 
    """
    GET: List all questions (active and inactive).
    POST: Create a new question with the logged-in official as creator.
    """
    queryset = Question.objects.all().order_by("-created_at")
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set 'created_by' to the current official
        official = getattr(self.request.user, "official", None)
        serializer.save(created_by=official)

class QuestionDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a single question.
    PUT/PATCH: Update question details
    DELETE: Toggle ques_is_active (soft activate/deactivate).
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user.official

        # Capture old data before update
        old_data = {
            "ques_category": instance.ques_category,
            "ques_question_text": instance.ques_question_text,
            "ques_answer_type": instance.ques_answer_type,
        }

        # Temporarily apply serializer data without saving to DB yet
        updated_fields = {
            **old_data,
            **serializer.validated_data,
        }

        # Detect if there are any differences
        changes_detected = any(
            old_data[field] != updated_fields[field]
            for field in old_data
            if field in updated_fields
        )

        #  If nothing changed — do NOT save or log
        if not changes_detected:
            raise serializers.ValidationError(
                {"detail": "No changes detected — update skipped."}
            )

        # If changes exist, save as normal
        updated_instance = serializer.save()

        # Capture new data
        new_data = {
            "ques_category": updated_instance.ques_category,
            "ques_question_text": updated_instance.ques_question_text,
            "ques_answer_type": updated_instance.ques_answer_type,
        }

        # Build readable change text
        field_labels = {
            "ques_category": "Category",
            "ques_question_text": "Question Text",
            "ques_answer_type": "Answer Type",
        }

        changes = []
        for field in old_data:
            if old_data[field] != new_data[field]:
                old_val = old_data[field] or "(empty)"
                new_val = new_data[field] or "(empty)"
                label = field_labels.get(field, field.replace("_", " ").title())
                changes.append(f"• {label} changed from '{old_val}' → '{new_val}'")

        description = "\n".join(changes)

        # Log only if real changes were made
        log_change(
            user=self.request.user,
            model_name="Question",
            record_id=updated_instance.ques_id,
            action="UPDATE",
            description=description,
            old_data=old_data,
            new_data=new_data,
        )


    def delete(self, request, *args, **kwargs):
        question = self.get_object()
        question.ques_is_active = not question.ques_is_active
        question.save(update_fields=["ques_is_active"])
        action = "activated" if question.ques_is_active else "deactivated"

        # Log activation/deactivation
        log_change(
            user=request.user,
            model_name="Question",
            record_id=question.ques_id,
            action="DELETE",
            description=f"Question {action}.",
        )

        return Response({"message": f"Question {action} successfully."}, status=200)
    
class QuestionBulkCreate(generics.CreateAPIView):
    """
    POST: Bulk create multiple questions at once.
    - Uses BulkQuestionSerializer to validate and save.
    """
    serializer_class = BulkQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created = serializer.save()
        return Response(QuestionSerializer(created, many=True).data, status=201)

class QuestionChoices(APIView): 
    """
    GET: Return available categories and answer types.
    - Used by frontend dropdowns when creating questions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({
            "categories": [c[0] for c in Question.QUESTION_CATEGORIES],
            "answer_types": [a[0] for a in Question.ANSWER_TYPES],
        })

# ---- SessionTypeQuestion ----
class SessionTypeQuestionListCreate(generics.ListCreateAPIView):
    """
    GET: List all question-to-session-type mappings.
    POST: Create a new mapping between a question and a session type/number.
    """
    queryset = SessionTypeQuestion.objects.all()
    serializer_class = SessionTypeQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class BulkAssignView(APIView):
    """
    POST: Bulk assign multiple questions to multiple session types and session numbers.
    - Clears old mappings first.
    - Recreates new mappings based on the updated selections.
    - Logs only if there were previous mappings (reassignment).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = BulkAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        questions = serializer.validated_data["questions"]
        session_numbers = serializer.validated_data["session_numbers"]
        session_types = serializer.validated_data["session_types"]

        created = []

        for q_id in questions:
            # --- Get old mappings before clearing ---
            old_mappings = SessionTypeQuestion.objects.filter(question_id=q_id)
            old_numbers = sorted(set(old_mappings.values_list("session_number", flat=True)))
            old_type_ids = sorted(set(old_mappings.values_list("session_type_id", flat=True)))
            old_type_names = list(
                SessionType.objects.filter(id__in=old_type_ids).values_list("name", flat=True)
            )

            had_old_assignments = old_mappings.exists()  # 👈 check if it’s a reassignment

            # --- Delete old mappings ---
            old_mappings.delete()

            # --- Create new mappings ---
            for num in session_numbers:
                for st_id in session_types:
                    mapping = SessionTypeQuestion.objects.create(
                        session_number=num,
                        session_type_id=st_id,
                        question_id=q_id,
                    )
                    created.append(mapping)

            # --- Skip logging if this is the first assignment ---
            if not had_old_assignments:
                continue

            # --- Fetch new readable data ---
            new_type_names = list(
                SessionType.objects.filter(id__in=session_types).values_list("name", flat=True)
            )

            # --- Determine differences ---
            added_numbers = [n for n in session_numbers if n not in old_numbers]
            removed_numbers = [n for n in old_numbers if n not in session_numbers]
            added_types = [t for t in new_type_names if t not in old_type_names]
            removed_types = [t for t in old_type_names if t not in new_type_names]

            # --- Build readable change description ---
            desc_lines = []
            if added_numbers:
                desc_lines.append(f"• Added Session Numbers: {', '.join(map(str, added_numbers))}")
            if removed_numbers:
                desc_lines.append(f"• Removed Session Numbers: {', '.join(map(str, removed_numbers))}")
            if added_types:
                desc_lines.append(f"• Added Session Types: {', '.join(added_types)}")
            if removed_types:
                desc_lines.append(f"• Removed Session Types: {', '.join(removed_types)}")

            if not desc_lines:
                desc_lines.append("No changes to session assignments.")
            description = "\n".join(desc_lines)

            # --- Log only reassignment changes ---
            log_change(
                user=request.user,
                model_name="SessionTypeQuestion",
                record_id=q_id,
                action="ASSIGN",
                description=description,
                old_data={
                    "session_numbers": old_numbers,
                    "session_types": old_type_names,
                },
                new_data={
                    "session_numbers": session_numbers,
                    "session_types": new_type_names,
                },
            )

        return Response(SessionTypeQuestionSerializer(created, many=True).data, status=201)

class SessionTypeQuestionDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a single question-to-session-type mapping.
    PUT/PATCH: Update mapping details.
    DELETE: Remove a mapping.
    """
    queryset = SessionTypeQuestion.objects.all()
    serializer_class = SessionTypeQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

# ---- SessionType (for dropdowns) ----
class SessionTypeList(generics.ListAPIView):
    """
    GET: List all available session types.
    - Used in dropdowns when assigning questions to sessions.
    """
    queryset = SessionType.objects.all()
    serializer_class = SessionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChangeLogListView(generics.ListAPIView):
    """DSWD Admin: View all system change logs.
       For now it's only used in question changelogs
    """
    queryset = ChangeLog.objects.all().select_related("user")
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangeLogSerializer

#============================================Account Management======================================
def _audit(actor, action, target, reason=None, changes=None):
    return AuditLog.objects.create(
        actor=actor,
        action=action,
        target_model=target.__class__.__name__,
        target_id=str(getattr(target, "pk", None)),
        reason=reason,
        changes=changes or {},
    )

def _audit_safe(value):
    """Return a JSON-serializable representation of common Django objects."""
    # Files / images from serializer or model
    if isinstance(value, FieldFile):
        return value.name or None  # e.g. "photos/abc.jpg"
    # InMemoryUploadedFile or any file-like with a name
    if hasattr(value, "read") and hasattr(value, "name"):
        return getattr(value, "name", "uploaded_file")

    # Model instances -> ModelLabel:pk
    if hasattr(value, "_meta") and hasattr(value, "pk"):
        try:
            return f"{value._meta.label}:{value.pk}"
        except Exception:
            return str(value)

    # Datetimes/dates
    if isinstance(value, (datetime, date)):
        return value.isoformat()

    # Containers
    if isinstance(value, dict):
        return {k: _audit_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_audit_safe(v) for v in value]

    # Primitives or fallback
    try:
        json.dumps(value)
        return value
    except TypeError:
        return str(value)

class OfficialViewSet(ModelViewSet):
    queryset = Official.objects.all()
    serializer_class = OfficialSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    allowed_roles = ["DSWD"]  # for IsRole

    def get_queryset(self):
        qs = Official.objects.filter(
            of_role__in=["Social Worker", "Nurse", "Psychometrician"]
        )

        include_archived = self.request.query_params.get("include_archived") in {"1", "true", "True"}

        # Combined actions must be allowed to see archived records
        if self.action not in {
            "retrieve",
            "archive_or_deactivate",
            "unarchive_or_reactivate",
        } and not include_archived:
            qs = qs.filter(deleted_at__isnull=True)

        return qs.order_by("of_lname", "of_fname")

    def get_permissions(self):
        # Only DSWD can modify state or update
        if self.action in {
            "archive_or_deactivate",
            "unarchive_or_reactivate",
            "partial_update",
            "update",
        }:
            return [IsAuthenticated(), IsRole()]
        return super().get_permissions()

    # ---------------------------------------------------
    #  COMBINED ACTION 1 — ARCHIVE + DEACTIVATE
    # ---------------------------------------------------
    @action(detail=True, methods=["post"])
    def archive_or_deactivate(self, request, pk=None):
        official = self.get_object()
        reason = request.data.get("reason")

        # CASE A — archive + deactivate
        if not official.deleted_at:
            official.deleted_at = timezone.now()
            official.save(update_fields=["deleted_at"])

            if official.user_id and official.user.is_active:
                official.user.is_active = False
                official.user.save(update_fields=["is_active"])

            _audit(request.user, "archive", official, reason=reason, changes={"archived_at": [None, str(official.deleted_at)]})
            return Response({
                "status": "archived_and_deactivated",
                "deleted_at": official.deleted_at
            })

        # CASE B — archived already → deactivate only
        if official.user_id and official.user.is_active:
            official.user.is_active = False
            official.user.save(update_fields=["is_active"])

            _audit(request.user, "deactivate", official, reason=reason, changes={"archived_at": [None, str(official.deleted_at)]})
            return Response({"status": "deactivated"})

        return Response({"detail": "Already archived & deactivated."}, status=400)

    # ---------------------------------------------------
    #  COMBINED ACTION 2 — UNARCHIVE + REACTIVATE
    # ---------------------------------------------------
    @action(detail=True, methods=["post"])
    def unarchive_or_reactivate(self, request, pk=None):
        official = self.get_object()
        reason = request.data.get("reason")

        # CASE A — unarchive + reactivate
        if official.deleted_at:
            before = official.deleted_at
            official.deleted_at = None
            official.save(update_fields=["deleted_at"])

            if official.user_id and not official.user.is_active:
                official.user.is_active = True
                official.user.save(update_fields=["is_active"])

            _audit(
                request.user,
                "unarchive",
                official,
                reason=reason,
                changes={"deleted_at": [str(before), None]},
            )
            return Response({"status": "unarchived_and_reactivated"})

        # CASE B — reactivate only
        if official.user_id and not official.user.is_active:
            official.user.is_active = True
            official.user.save(update_fields=["is_active"])

            _audit(request.user, "reactivate", official, reason=reason)
            return Response({"status": "reactivated"})

        return Response({"detail": "Already active and not archived."}, status=400)

    # ---------------------------------------------------
    #  AUDITS LIST
    # ---------------------------------------------------
    @action(detail=True, methods=["get"])
    def audits(self, request, pk=None):
        qs = AuditLog.objects.filter(
            target_model="Official",
            target_id=str(pk)
        ).order_by("-created_at")[:50]

        return Response(AuditLogSerializer(qs, many=True).data)

    
# class OfficialViewSet(ModelViewSet):
#    queryset = Official.objects.all()
#    serializer_class = OfficialSerializer
#    #permission_classes = [IsAuthenticated] #it allows all officials to view it but requires login  
#    permission_classes = [AllowAny] #it allows all officials to view it but requires login  

#    def get_queryset(self):
#         return Official.objects.filter(
#             of_role__in=["Social Worker", "VAWDesk"]
#         ).exclude(
#             of_role="VAWDesk", status="pending"
#         )
    
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
            generated_password = get_random_string(length=16)

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


#===========================================Services=====================================
class ServiceCategoryListView(generics.ListAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
        
#create service
class ServicesListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicesSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get_queryset(self):
        queryset = Services.objects.all()
        category = self.request.query_params.get("category", None)
        is_active = self.request.query_params.get("is_active")

        if category and category != "All":
            queryset = queryset.filter(category_id=category)  # ✅ use category_id
        if is_active in ["true", "false"]:
            queryset = queryset.filter(is_active=(is_active == "true"))
        return queryset

#edit/deactivate
class ServicesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    # permission_classes = [permissions.IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


#==========================================Change Password (admin side)==============================
class ChangePasswordFaceView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']
    SIMILARITY_THRESHOLD = 0.65  # same as face_login

    def decrypt_temp_file(self, encrypted_path):
        """Decrypt .enc image into a temporary .jpg file."""
        fernet = Fernet(settings.FERNET_KEY)
        with open(encrypted_path, "rb") as enc_file:
            encrypted_data = enc_file.read()
        decrypted_data = fernet.decrypt(encrypted_data)

        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        temp.write(decrypted_data)
        temp.flush()
        temp.close()
        return temp.name

    def post(self, request):
        uploaded_file = request.FILES.get("frame")
        if not uploaded_file:
            return Response({"success": False, "message": "No image uploaded."}, status=400)

        # Save webcam frame temporarily
        try:
            temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            image = Image.open(uploaded_file).convert("RGB")
            image.save(temp_image, format="JPEG")
            temp_image.flush()
            temp_image.close()
            chosen_frame = temp_image.name
        except Exception as e:
            return Response({"success": False, "message": f"Failed to save image: {str(e)}"}, status=400)

        best_match = None
        best_sample = None
        best_score = -1.0
        decrypted_temp_files = []

        try:
            # Generate embedding for uploaded frame
            embeddings = DeepFace.represent(
                img_path=chosen_frame,
                model_name="ArcFace",
                enforce_detection=True
            )

            # Handle DeepFace return formats
            frame_embedding = None
            if isinstance(embeddings, list):
                if len(embeddings) > 0 and isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
                    frame_embedding = embeddings[0]["embedding"]
                elif all(isinstance(x, (int, float)) for x in embeddings):
                    frame_embedding = embeddings
            elif isinstance(embeddings, dict) and "embedding" in embeddings:
                frame_embedding = embeddings["embedding"]

            if frame_embedding is None:
                return Response({"success": False, "message": "Could not extract face embedding."}, status=400)

            frame_embedding = np.array(frame_embedding).reshape(1, -1)

            # Compare with stored embeddings
            for sample in OfficialFaceSample.objects.select_related("official"):
                official = sample.official
                embedding = sample.embedding

                try:
                    if embedding:
                        # Compare embeddings directly
                        sample_embedding = np.array(embedding).reshape(1, -1)
                        score = cosine_similarity(frame_embedding, sample_embedding)[0][0]
                        accuracy = score * 100
                        is_match = score >= self.SIMILARITY_THRESHOLD
                        print(
                            f"[FORGOT-PASS] Comparing with {official.full_name} | "
                            f"Score: {score:.4f} | Accuracy: {accuracy:.2f}% | "
                            f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: {is_match}"
                        )
                        if score > best_score:
                            best_score = score
                            best_match = official
                            best_sample = sample
                    else:
                        # Fallback to encrypted image comparison
                        photo_path = sample.photo.path
                        if photo_path.lower().endswith(".enc"):
                            photo_path = self.decrypt_temp_file(photo_path)
                            decrypted_temp_files.append(photo_path)

                        result = DeepFace.verify(
                            img1_path=chosen_frame,
                            img2_path=photo_path,
                            model_name="ArcFace",
                            enforce_detection=True
                        )
                        if result.get("verified"):
                            score = 1.0 / (1.0 + result["distance"])
                            if score > best_score:
                                best_score = score
                                best_match = official
                                best_sample = sample

                except Exception as ve:
                    print(f"[WARN] Skipping {official.full_name}: {str(ve)}")
                    continue

            # Evaluate result
            if best_match and best_score >= self.SIMILARITY_THRESHOLD:
                accuracy = best_score * 100
                print(
                    f"[FORGOT-PASS] MATCH FOUND | Name: {best_match.full_name} | "
                    f"Similarity: {best_score:.4f} | Accuracy: {accuracy:.2f}% | "
                    f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: TRUE"
                )
                return Response({
                    "success": True,
                    "official": {
                        "id": best_match.of_id,
                        "username": best_match.user.username,
                        "full_name": best_match.full_name,
                    },
                    "similarity_score": float(best_score),
                    "threshold": self.SIMILARITY_THRESHOLD,
                }, status=200)

            accuracy = best_score * 100 if best_score > 0 else 0
            print(
                f"[FORGOT-PASS] NO MATCH | Best Score: {best_score:.4f} | "
                f"Accuracy: {accuracy:.2f}% | Threshold: {self.SIMILARITY_THRESHOLD}"
            )
            return Response({"success": False, "message": "No matching account found."}, status=404)

        except Exception as e:
            traceback.print_exc()
            return Response({"success": False, "message": str(e)}, status=400)

        finally:
            # Clean up all temp files
            if os.path.exists(chosen_frame):
                os.remove(chosen_frame)
            for f in decrypted_temp_files:
                if os.path.exists(f):
                    os.remove(f)

    
User = get_user_model()
token_generator = PasswordResetTokenGenerator()

# ✅ Step 2: Email Verification (works with or without face recog)
class VerifyEmailView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def post(self, request):
        official_id = request.data.get("official_id")  # optional
        email = request.data.get("email") or request.data.get("of_email")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # CASE A: Face recog success → verify against official record
        if official_id:
            try:
                official = Official.objects.get(of_id=official_id)
            except Official.DoesNotExist:
                return Response({"error": "Official not found"}, status=status.HTTP_400_BAD_REQUEST)

            if official.of_email != email:
                return Response({"error": "Email does not match our records"}, status=status.HTTP_400_BAD_REQUEST)

            user = official.user
            if not user:
                return Response({"error": "No linked user account"}, status=status.HTTP_400_BAD_REQUEST)

        # CASE B: No face recog → fallback to email-only
        else:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate token + uid
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        # Always send email
        send_mail(
            subject="Password Reset Request",
            message=f"A password reset was requested for your account.\n\n"
                    f"Click the link to reset your password: {reset_link}\n\n"
                    f"If this wasn’t you, please contact support immediately.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        # Return to frontend (so React modal can also use uid+token directly if needed)
        return Response({
            "success": True,
            "message": "Password reset instructions sent",
            "uid": uid,
            "reset_token": token,
        }, status=status.HTTP_200_OK)


# ✅ Step 3: Reset Password
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not (uidb64 and token and new_password):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (get_user_model().DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        # Apply new password
        user.set_password(new_password)
        user.save()

        # ------------- AUDIT LOGGING -------------
        official = getattr(user, "official", None)

        changes = {
            "password": ["<old password>", "<new password>"]
        }

        _audit(
            actor=user,  # Password reset is initiated by user via link
            action="change pass",
            target=official if official else user,
            reason="Password reset via email link",
            changes=_audit_safe(changes),
        )
        # ------------------------------------------

        return Response(
            {"success": True, "message": "Password reset successful"},
            status=status.HTTP_200_OK
        )

# class ResetPasswordView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         uidb64 = request.data.get("uid")
#         token = request.data.get("token")
#         new_password = request.data.get("new_password")

#         if not (uidb64 and token and new_password):
#             return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             uid = force_str(urlsafe_base64_decode(uidb64))
#             user = get_user_model().objects.get(pk=uid)
#         except (get_user_model().DoesNotExist, ValueError, TypeError):
#             return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

#         if not default_token_generator.check_token(user, token):
#             return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # Validate the new password
#             validate_password(new_password, user)
#         except ValidationError as e:
#             return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

#         user.set_password(new_password)
#         user.save()

#         return Response({"success": True, "message": "Password reset successful"}, status=status.HTTP_200_OK)


# ============================= Dashboard =======================================
class DSWDDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get(self, request):
        today = date.today()

        # ---------------- Victim Summary ----------------
        victims_all = Victim.objects.all()
        victims = [v for v in victims_all if getattr(v, "vic_sex", None) == "Female"]

        total_female_victims = len(victims)

        # Age group counters
        age_0_18, age_18_35, age_36_50, age_51_plus = 0, 0, 0, 0

        for v in victims:
            birth = getattr(v, "vic_birth_date", None)
            if birth:
                age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
                if age < 18:
                    age_0_18 += 1
                elif 18 <= age <= 35:
                    age_18_35 += 1
                elif 36 <= age <= 50:
                    age_36_50 += 1
                elif age >= 51:
                    age_51_plus += 1

        # Percentages
        age_0_18_percent = round((age_0_18 / total_female_victims) * 100, 1) if total_female_victims > 0 else 0
        age_18_35_percent = round((age_18_35 / total_female_victims) * 100, 1) if total_female_victims > 0 else 0
        age_36_50_percent = round((age_36_50 / total_female_victims) * 100, 1) if total_female_victims > 0 else 0
        age_51_plus_percent = round((age_51_plus / total_female_victims) * 100, 1) if total_female_victims > 0 else 0

        victim_summary = {
            "total_female_victims": total_female_victims,
            "age_0_18": age_0_18,
            "age_18_35": age_18_35,
            "age_36_50": age_36_50,
            "age_51_plus": age_51_plus,
            "age_0_18_percent": age_0_18_percent,   
            "age_18_35_percent": age_18_35_percent,
            "age_36_50_percent": age_36_50_percent,
            "age_51_plus_percent": age_51_plus_percent,
        }

        # ---------------- Incident Summary ----------------
        incidents = IncidentInformation.objects.all()
        total_cases = incidents.count()

        active_cases = sum(1 for i in incidents if getattr(i, "incident_status", None) in ["Pending", "Ongoing"])
        resolved_cases = sum(1 for i in incidents if getattr(i, "incident_status", None) == "Done")

        LIMIT_ACTIVE = 100
        LIMIT_RESOLVED = 100

        active_percent = round((active_cases / LIMIT_ACTIVE) * 100, 1) if LIMIT_ACTIVE > 0 else 0
        resolved_percent = round((resolved_cases / LIMIT_RESOLVED) * 100, 1) if LIMIT_RESOLVED > 0 else 0

        violence_types = Counter(
            getattr(i, "violence_type", None)
            for i in incidents if getattr(i, "violence_type", None)
        )
        violence_types_dict = dict(violence_types)

        total_violence = sum(violence_types.values())
        top_type, top_percent = "N/A", 0.0
        if total_violence > 0:
            top_key, top_count = violence_types.most_common(1)[0]
            top_type = top_key
            top_percent = round((top_count / total_violence) * 100, 1)

        status_counts = incidents.values("incident_status").annotate(count=Count("incident_status"))
        status_types = {s["incident_status"]: s["count"] for s in status_counts}

        incident_summary = {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "active_percent": active_percent,
            "resolved_cases": resolved_cases,
            "resolved_percent": resolved_percent,
            "violence_types": violence_types_dict,
            "status_types": status_types,
            "top_violence_type": top_type,
            "top_violence_percent": top_percent,
        }

        # ---------------- Monthly Report Rows ----------------
        report_rows = []
        for i in range(1, 13):
            month_incidents = [
                inc for inc in incidents
                if getattr(inc, "incident_date", None)
                and inc.incident_date.month == i
                and inc.incident_date.year == today.year
            ]
            report_rows.append({
                "month": month_name[i],
                "totalVictims": len(month_incidents),
                "Physical Violence": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Physical Violence"),
                "Physical Abused": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Physical Abused"),
                "Psychological Violence": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Psychological Violence"),
                "Psychological Abuse": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Psychological Abuse"),
                "Economic Abused": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Economic Abused"),
                "Strandee": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Strandee"),
                "Sexually Abused": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Sexually Abused"),
                "Sexually Exploited": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Sexually Exploited"),
                "referredDSWD": 0,
                "referredHospital": 0,
            })

        return Response({
            "victim_summary": FemaleVictimSummarySerializer(victim_summary).data,
            "incident_summary": IncidentSummarySerializer(incident_summary).data,
            "monthly_report_rows": MonthlyReportRowSerializer(report_rows, many=True).data,
        })
    
#===========================================Profile==========================================
# class ProfileViewSet(viewsets.GenericViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     def get_object(self):
#         """
#         Get the official profile related to the authenticated user.
#         """
#         user = self.request.user
#         try:
#             official = user.official
#         except Official.DoesNotExist:
#             raise Response({"message": "Profile not found for the logged-in user."}, status=404)
#         return official

#     # GET request to fetch the current user's profile
#     def retrieve(self, request, *args, **kwargs):
#         official = self.get_object()
#         serializer = OfficialSerializer(official)
#         return Response(serializer.data)

#     # PUT request to update the current user's profile
#     def update(self, request, *args, **kwargs):
#         official = self.get_object()
#         serializer = OfficialSerializer(official, data=request.data, partial=True)  # partial=True allows partial updates
#         if serializer.is_valid():
#             serializer.save()  # Save the updated profile data
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)

def _diff(instance, new_data):
    changes = {}
    for field, new_value in new_data.items():
        old_value = getattr(instance, field, None)
        if old_value != new_value:
            changes[field] = [str(old_value), str(new_value)]
    return changes


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        user = self.request.user
        try:
            return user.official
        except Official.DoesNotExist:
            raise Response({"message": "Profile not found for the logged-in user."}, status=404)

    def retrieve(self, request, *args, **kwargs):
        official = self.get_object()
        serializer = OfficialSerializer(official)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        official = self.get_object()
        data = request.data.copy()

        # ---- Track old data ----
        old_instance = Official.objects.get(pk=official.pk)

        # ---- Normalize address flag ----
        is_address_updated = data.get("isAddressUpdated", False)
        if isinstance(is_address_updated, str):
            is_address_updated = is_address_updated.lower() == "true"

        # ---- Handle photo ----
        if "of_photo" in request.FILES:
            official.of_photo = request.FILES["of_photo"]

        # ---- Handle address ----
        new_address = data.get("address")
        if isinstance(new_address, str):
            try:
                new_address = json.loads(new_address)
            except json.JSONDecodeError:
                new_address = None

        if is_address_updated and new_address:
            # Prevent overwriting names accidentally
            for field in ["of_fname", "of_lname"]:
                data.pop(field, None)

            # Validate fields
            missing_fields = [f.capitalize() for f in ["province", "municipality", "barangay", "sitio", "street"] if not new_address.get(f)]
            if missing_fields:
                return Response({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)

            # Delete old address if it exists
            try:
                if official.address:
                    official.address.delete()
            except Address.DoesNotExist:
                pass  # safe if no address exists

            # Create new address
            try:
                province = Province.objects.get(id=new_address.get("province"))
                municipality = Municipality.objects.get(id=new_address.get("municipality"))
                barangay = Barangay.objects.get(id=new_address.get("barangay"))
            except (Province.DoesNotExist, Municipality.DoesNotExist, Barangay.DoesNotExist):
                return Response({"error": "Invalid address IDs provided."}, status=400)

            official.address = Address.objects.create(
                province=province,
                municipality=municipality,
                barangay=barangay,
                sitio=new_address.get("sitio"),
                street=new_address.get("street"),
            )

        # ---- Save main changes ----
        serializer = OfficialSerializer(official, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # ---- Detect changes ----
        changes = _diff(old_instance, serializer.validated_data)

        # ---- Address logging ----
        if is_address_updated:
            try:
                old_addr_str = str(old_instance.address)
            except Address.DoesNotExist:
                old_addr_str = "None"

            new_addr_str = str(official.address) if official.address else "None"
            changes["address"] = [old_addr_str, new_addr_str]

        # ---- Photo logging ----
        if "of_photo" in request.FILES:
            changes["of_photo"] = ["<old photo>", "<new uploaded photo>"]

        # ---- Write audit log ----
        if changes:
            _audit(
                actor=request.user,
                action="update",
                target=official,
                reason=request.data.get("reason", "Profile update"),
                changes=_audit_safe(changes),
            )

        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def audits(self, request, pk=None):
        qs = AuditLog.objects.filter(
            target_model="Official",
            target_id=str(pk)
        ).order_by("-created_at")[:50]
        return Response(AuditLogSerializer(qs, many=True).data)

    
#==========================================Change Password (user side)==============================
User = get_user_model()

# class UpdateUsernamePasswordView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         user = request.user
#         new_username = request.data.get("username")
#         current_password = request.data.get("current_password")
#         new_password = request.data.get("new_password")
#         confirm_password = request.data.get("confirm_password")

#         # Basic validation
#         if not all([new_username, current_password, new_password, confirm_password]):
#             return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

#         if not user.check_password(current_password):
#             return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

#         if new_password != confirm_password:
#             return Response({"error": "New password and confirmation do not match"}, status=status.HTTP_400_BAD_REQUEST)

#         # Validate password strength
#         try:
#             validate_password(new_password, user)
#         except Exception as e:
#             return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

#         # Update username & password
#         if new_username != user.username:
#             if User.objects.filter(username=new_username).exists():
#                 return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
#             user.username = new_username

#         user.set_password(new_password)
#         user.save()

#         return Response({"success": True, "message": "Username and password updated successfully"})

class UpdateUsernamePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        official = getattr(user, "official", None)  # For audit logging

        new_username = request.data.get("username")
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Basic validation
        if not all([new_username, current_password, new_password, confirm_password]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New password and confirmation do not match"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        # Track old values for audit purposes
        changes = {}

        # Username change
        if new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            
            changes["username"] = [user.username, new_username]
            user.username = new_username

        # Password change
        changes["password"] = ["<old password>", "<new password>"]  # Do NOT log plaintext

        # Apply updates
        user.set_password(new_password)
        user.save()

        # ---- Write Audit Log ----
        _audit(
            actor=request.user,
            action="change pass",
            target=official if official else user,
            reason="User updated username and/or password",
            changes=_audit_safe(changes),
        )

        return Response({"success": True, "message": "Username and password updated successfully"})

    
#========================================== Login Tracker ==============================
class LoginTrackerListAPIView(APIView):
    """
    Admin-only endpoint to view login tracker logs
    """
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["DSWD"]  # only DSWD/admin can view

    def get(self, request):
        logs = LoginTracker.objects.order_by("-login_time")[:200]  # last 200 logs
        serializer = LoginTrackerSerializer(logs, many=True)
        return Response(serializer.data)

class LoginTrackerCleanupAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["DSWD"]

    def delete(self, request):
        threshold = timezone.now() - timedelta(days=14)
        deleted_count, _ = LoginTracker.objects.filter(
            login_time__lt=threshold
        ).delete()

        return Response({"deleted": deleted_count})
