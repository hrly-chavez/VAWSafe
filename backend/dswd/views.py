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
from datetime import date, datetime
from calendar import month_name
from collections import Counter
import json
from dswd.utils.logging import log_change

#forgot password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from cryptography.fernet import Fernet
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.tokens import default_token_generator


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
    
class ProvinceList(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    # permission_classes = [IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]

class MunicipalityList(generics.ListAPIView):
    serializer_class = MunicipalitySerializer
    # permission_classes = [IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]

    def get_queryset(self):
        province_id = self.request.query_params.get("province")
        queryset = Municipality.objects.all()
        if province_id:
            queryset = queryset.filter(province_id=province_id)
        return queryset

class BarangayList(generics.ListAPIView):
    serializer_class = BarangaySerializer
    # permission_classes = [IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]

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

IMMUTABLE_FIELDS = {"of_fname", "of_lname", "of_dob"}  # protect unless special flow

def _diff(before, after):
    changes = {}
    for k, new in after.items():
        old = getattr(before, k, None)
        if old != new:
            changes[k] = [old, new]
    return changes

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
    permission_classes = [IsAuthenticated]  # default for safe methods

    def get_queryset(self):
        qs = Official.objects.filter(
            of_role__in=["Social Worker", "Nurse", "Psychometrician"]
        )

        # include_archived=1 to see archived in lists
        include_archived = self.request.query_params.get("include_archived") in {"1", "true", "True"}

        # Hide archived by default for list, BUT allow them for retrieve AND unarchive
        if self.action not in {"retrieve", "unarchive"} and not include_archived:
            qs = qs.filter(deleted_at__isnull=True)

        return qs.order_by("of_lname", "of_fname")

    # ---- permissions per action ----
    def get_permissions(self):
        if self.action in {"deactivate","reactivate","archive","unarchive","partial_update","update"}:
            # DSWD only for state changes and edits
            return [IsAuthenticated(), IsRole()]
        return super().get_permissions()

    # Make IsRole check this
    allowed_roles = ["DSWD"]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        reason = request.data.get("reason") or request.headers.get("X-Reason")

        incoming = request.data.copy()
        stripped = {}
        for f in IMMUTABLE_FIELDS:
            if f in incoming:
                stripped[f] = incoming.pop(f)

        serializer = self.get_serializer(instance, data=incoming, partial=partial)
        serializer.is_valid(raise_exception=True)

        # compute diff BEFORE saving
        changes = _diff(instance, serializer.validated_data)

        # save
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        # sanitize for JSONField
        if changes or stripped:
            if stripped:
                changes["_immutable_rejected"] = {k: v for k, v in stripped.items()}
            safe_changes = _audit_safe(changes)
            _audit(request.user, "update", serializer.instance, reason=reason, changes=safe_changes)

        return Response(serializer.data)


    # ---- custom actions ----
    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        official = self.get_object()
        if not official.user_id:
            return Response({"detail": "No linked user to deactivate."}, status=400)
        official.user.is_active = False
        official.user.save(update_fields=["is_active"])
        _audit(request.user, "deactivate", official, reason=request.data.get("reason"))
        return Response({"status": "deactivated"})

    @action(detail=True, methods=["post"])
    def reactivate(self, request, pk=None):
        official = self.get_object()
        if not official.user_id:
            return Response({"detail": "No linked user to reactivate."}, status=400)
        official.user.is_active = True
        official.user.save(update_fields=["is_active"])
        _audit(request.user, "reactivate", official, reason=request.data.get("reason"))
        return Response({"status": "reactivated"})

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        official = self.get_object()
        if official.deleted_at:
            return Response({"detail": "Already archived."}, status=400)

        # 1) Mark archived
        official.deleted_at = timezone.now()
        official.save(update_fields=["deleted_at"])

        # 2) Optional safety: also deactivate their user so they cannot log in
        if official.user_id and official.user.is_active:
            official.user.is_active = False
            official.user.save(update_fields=["is_active"])

        _audit(request.user, "archive", official, reason=request.data.get("reason"))
        return Response({"status": "archived", "deleted_at": official.deleted_at})
    
    @action(detail=True, methods=["post"])
    def unarchive(self, request, pk=None):
        official = self.get_object()
        if not official.deleted_at:
            return Response({"detail": "Not archived."}, status=400)

        before = official.deleted_at
        official.deleted_at = None
        official.save(update_fields=["deleted_at"])

        # Do NOT auto-reactivate login; require an explicit "reactivate" click
        _audit(request.user, "update", official, reason=request.data.get("reason"),
            changes={"deleted_at": [str(before), None]})
        return Response({"status": "unarchived"})

    @action(detail=True, methods=["get"])
    def audits(self, request, pk=None):
        qs = AuditLog.objects.filter(target_model="Official", target_id=str(pk)).order_by("-created_at")[:50]
        from .serializers import AuditLogSerializer
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


#==========================================Forgot Password==============================
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
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not (uidb64 and token and new_password):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"success": True, "message": "Password reset successful"}, status=status.HTTP_200_OK)


#=============================Dashboard======================================
class DSWDDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get(self, request):
        today = date.today()

        #Victim Summary
        victims = [v for v in Victim.objects.all() if v.vic_sex == "Female"]
        total_female_victims = len(victims)
        minors = 0
        adults = 0

        for victim in victims:
            if victim.vic_birth_date:
                age = (
                    today.year
                    - victim.vic_birth_date.year
                    - ((today.month, today.day) < (victim.vic_birth_date.month, victim.vic_birth_date.day))
                )
                if age < 18:
                    minors += 1
                else:
                    adults += 1

        victim_summary = {
            "total_female_victims": total_female_victims,
            "minors": minors,
            "adults": adults,
        }

        #Incident Summary
        incidents = IncidentInformation.objects.all()
        total_cases = incidents.count()
        active_cases = len([
            i for i in incidents
            if i.incident_status in ["Pending", "Ongoing"]
        ])

        violence_types = Counter(
            i.violence_type for i in incidents if i.violence_type
        )
        violence_types_dict = dict(violence_types)

        total_violence = sum(violence_types.values())
        if total_violence > 0:
            top_key, top_count = violence_types.most_common(1)[0]
            top_type = f"{top_key} ({round((top_count / total_violence) * 100)}%)"
        else:
            top_type = "N/A"

        status_counts = (
            incidents.values("incident_status")
            .annotate(count=Count("incident_status"))
        )
        status_types = {s["incident_status"]: s["count"] for s in status_counts}

        incident_summary = {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "violence_types": violence_types_dict,
            "status_types": status_types,
            "top_violence_type": top_type,
        }

        #Monthly Report Rows
        report_rows = []
        for i in range(1, 13):
            month_incidents = [
                inc for inc in incidents
                if inc.incident_date and inc.incident_date.month == i
            ]   
            report_rows.append({
                "month": month_name[i],
                "totalVictims": len(month_incidents),
                "sexual": sum(1 for inc in month_incidents if inc.violence_type == "Sexual"),
                "physical": sum(1 for inc in month_incidents if inc.violence_type == "Physical"),
                "psychological": sum(1 for inc in month_incidents if inc.violence_type == "Psychological"),
                "economic": sum(1 for inc in month_incidents if inc.violence_type == "Economic"),
                "referredDSWD": 0,
                "referredHospital": 0,
            })

        #Serialize and return
        return Response({
            "victim_summary": FemaleVictimSummarySerializer(victim_summary).data,
            "incident_summary": IncidentSummarySerializer(incident_summary).data,
            "monthly_report_rows": MonthlyReportRowSerializer(report_rows, many=True).data,
        })