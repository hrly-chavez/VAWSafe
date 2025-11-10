import os, tempfile, traceback, json, logging, threading

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.db.models import Q
from django.db import transaction
from django.http import Http404
from deepface import DeepFace
from .serializers import *
import time
from datetime import date, timedelta
from PIL import Image
from shared_model.models import *
from shared_model.permissions import IsRole
from cryptography.fernet import Fernet
from shared_model.views import serve_encrypted_file
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework import viewsets
from rest_framework.decorators import action
from dswd.utils.logging import log_change

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic
def register_victim(request):
    """
    Unified endpoint:
    - Creates Victim (+ profile photo)
    - Stores victim face samples + embeddings (best-effort)
    - Optionally creates IncidentInformation, Perpetrator
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

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

        # 5.6) Contact Person (optional, after incident exists)
        contact_person = None
        contact_data = parse_json_field("contact_person")
        if contact_data and incident:
            contact_data["incident"] = incident.pk  # correct FK reference
            c_ser = ContactPersonSerializer(data=contact_data)
            if not c_ser.is_valid():
                print("[contact_person] errors:", c_ser.errors)
                return Response({"success": False, "errors": c_ser.errors},
                                status=status.HTTP_400_BAD_REQUEST)
            contact_person = c_ser.save()


        # # -------------------------------
        # # 6) CREATE VICTIM ACCOUNT (new)
        # # -------------------------------
        # fname = victim_data.get("vic_first_name", "").strip().lower()
        # lname = victim_data.get("vic_last_name", "").strip().lower()
        # base_username = f"{fname}{lname}".replace(" ", "") or get_random_string(8)

        # username = base_username
        # counter = 0
        # while User.objects.filter(username=username).exists():
        #     counter += 1
        #     username = f"{base_username}{counter}"

        # generated_password = get_random_string(length=12)
        # user = User.objects.create_user(username=username, password=generated_password)

        # # Optionally associate user with victim
        # victim.user = user  # <-- comment this out if Victim model has no FK to User
        # victim.save()

        return Response({
            "success": True,
            "victim": VictimSerializer(victim).data,
            "incident": IncidentInformationSerializer(incident).data if incident else None,
            "contact_person": ContactPersonSerializer(contact_person).data if contact_person else None,
            "perpetrator": PerpetratorSerializer(perpetrator).data if perpetrator else None,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        traceback.print_exc()
        transaction.set_rollback(True)
        return Response({"success": False, "error": str(e)},
                        status=status.HTTP_400_BAD_REQUEST)
 
class victim_list(generics.ListAPIView):
    serializer_class = VictimListSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['Social Worker']

    def get_queryset(self):
        # Allow all authenticated users with valid roles to see all victims
        user = self.request.user
        official = getattr(user, "official", None)
        role = getattr(official, "of_role", None)

        if not role:
            return Victim.objects.none()  #prevents non-officials

        return Victim.objects.all().distinct()

logger = logging.getLogger(__name__)

def cleanup_decrypted_file_later(file_path, victim_id, delay=10):
    """Helper function to delete the decrypted photo after a delay (in seconds)."""
    # Sleep for the delay period
    time.sleep(delay)  # This will correctly wait 10 seconds before deleting the file

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Successfully deleted decrypted photo for victim {victim_id}")
        else:
            logger.warning(f"Decrypted photo for victim {victim_id} not found for cleanup.")
    except Exception as e:
        logger.error(f"Failed to delete decrypted photo for victim {victim_id}: {e}")

class victim_detail(generics.RetrieveAPIView):
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Allow all authenticated officials (any role) to view all victims.
        """
        user = self.request.user
        if hasattr(user, "official"):
            return Victim.objects.all().distinct()
        return Victim.objects.none()

    def get_object(self):
        """
        Retrieve the victim directly — no role-based assignment restriction.
        """
        vic_id = self.kwargs.get(self.lookup_field)

        try:
            return Victim.objects.get(vic_id=vic_id)
        except Victim.DoesNotExist:
            raise NotFound("Victim not found.")
        
    def retrieve(self, request, *args, **kwargs):
        victim = self.get_object()

        decrypted_photo_path = None
        if victim.vic_photo.name.endswith('.enc'):
            try:
                # Decrypt the photo
                logger.info(f"Decrypting photo for victim {victim.vic_id}")
                fernet = Fernet(settings.FERNET_KEY)
                with open(victim.vic_photo.path, "rb") as enc_file:
                    encrypted_data = enc_file.read()
                decrypted_data = fernet.decrypt(encrypted_data)

                decrypted_photo_path = os.path.join(settings.MEDIA_ROOT, f"decrypted_{victim.vic_id}.jpg")
                with open(decrypted_photo_path, 'wb') as decrypted_file:
                    decrypted_file.write(decrypted_data)

                victim.vic_photo.name = os.path.relpath(decrypted_photo_path, settings.MEDIA_ROOT)

            except Exception as e:
                logger.error(f"Failed to decrypt photo for victim {victim.vic_id}: {e}")
                return Response({"error": f"Failed to decrypt photo: {str(e)}"}, status=400)

        # Return the victim data
        serializer = self.get_serializer(victim)
        if decrypted_photo_path:
            threading.Thread(target=cleanup_decrypted_file_later, args=(decrypted_photo_path, victim.vic_id, 10)).start()

        return Response(serializer.data)


# retrieve all information related to case ( Worker)

class VictimIncidentsView(generics.ListAPIView):
    serializer_class = IncidentInformationSerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["Social Worker", "Nurse", "Psychometrician", "Home Life"]

    def get_queryset(self):
        vic_id = self.kwargs.get("vic_id")
        return IncidentInformation.objects.filter(vic_id__pk=vic_id).order_by("incident_num")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)  
    
class search_victim_facial(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD', 'Social Worker']

    def decrypt_temp_file(self, encrypted_path):
        """Decrypt .enc image into a temporary .jpg file."""
        fernet = Fernet(settings.FERNET_KEY)
        try:
            with open(encrypted_path, "rb") as enc_file:
                encrypted_data = enc_file.read()
            decrypted_data = fernet.decrypt(encrypted_data)

            # Save the decrypted data to a temporary file with delete=True
            temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            temp.write(decrypted_data)
            temp.flush()
            temp.close()

            return temp.name
        except Exception as e:
            print(f"Error decrypting file {encrypted_path}: {e}")
            return None

    def post(self, request):
        # Check if the user has the correct role
        user_role = request.user.official.of_role
        if user_role not in self.allowed_roles:
            return Response({"error": "You are not authorized to use this API."}, status=403)

        uploaded_file = request.FILES.get("frame")
        if not uploaded_file:
            return Response({"error": "No image uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Save the temporary image
        try:
            temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            temp_image.write(uploaded_file.read())
            temp_image.flush()
            temp_image.close()
            chosen_frame = temp_image.name
        except Exception as e:
            return Response({"error": f"Failed to save uploaded image: {str(e)}"}, status=400)

        best_match = None
        best_sample = None
        lowest_distance = float("inf")
        decrypted_temp_files = []  # List to keep track of decrypted temp files

        try:
            # Check the role and filter VictimFaceSample accordingly
            if user_role == "DSWD":
                # DSWD can view all victims
                victim_samples = VictimFaceSample.objects.select_related("victim")
            elif user_role == "Social Worker":
                # Social Worker can only view assigned victims via the session model
                victim_samples = VictimFaceSample.objects.filter(
                    victim__incidents__sessions__assigned_official=request.user.official
                ).select_related("victim")

            for sample in victim_samples:
                try:
                    # Check if the photo is encrypted (.enc)
                    photo_path = sample.photo.path
                    if photo_path.lower().endswith(".enc"):
                        decrypted_photo_path = self.decrypt_temp_file(photo_path)
                        if decrypted_photo_path:
                            photo_path = decrypted_photo_path
                            decrypted_temp_files.append(decrypted_photo_path)  # Track decrypted files
                        else:
                            continue  # Skip this sample if decryption fails

                    # Perform face verification
                    result = DeepFace.verify(
                        img1_path=chosen_frame,
                        img2_path=photo_path,
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
            # Clean up the temporary image files
            if chosen_frame and os.path.exists(chosen_frame):
                os.remove(chosen_frame)

            # Clean up decrypted temp files after comparison
            for f in decrypted_temp_files:
                if os.path.exists(f):
                    os.remove(f)


#========================================SESSIONS====================================================
class scheduled_session_lists(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        official = getattr(user, "official", None)
        role = getattr(official, "of_role", None)
        if not role:
            return Session.objects.none()

        # Step 1: Get all sessions assigned to this official
        assigned_sessions = Session.objects.filter(
            assigned_official__in=[user.official]
        ).distinct()

        # Step 2: Filter manually (since sess_status is encrypted)
        filtered_sessions = [
            s for s in assigned_sessions
            if s.sess_status in ("Pending", "Ongoing")
        ]

        # Step 3: Sort by status then schedule
        filtered_sessions.sort(key=lambda s: (s.sess_status, s.sess_next_sched or now()))

        return filtered_sessions

class scheduled_session_detail(generics.RetrieveUpdateAPIView):  
    """
    GET: Retrieve a single session detail.
    PATCH: Update session info (e.g., type, description, location).
    this also handles the display for service in the frontend
    """
    serializer_class = SessionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        official = getattr(user, "official", None)
        role = getattr(official, "of_role", None)
        if not role:
            return Session.objects.none()

        return Session.objects.filter(
            incident_id__sessions__assigned_official=official
        ).distinct()

class SessionTypeListView(generics.ListAPIView):
    """GET: List all available session types for dropdowns."""
    queryset = SessionType.objects.all()
    serializer_class = SessionTypeSerializer
    permission_classes = [IsAuthenticated]

#Session Start 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mapped_questions(request):
    """
    GET: Returns mapped questions for a specific session number and session type(s).

    Behavior:
    - If `sess_id` is provided, filters questions based on all assigned officials' roles for that session.
    - Otherwise, defaults to old behavior (can still use role_filter=1 to filter by logged-in official's role).

    Example:
      /api/social_worker/mapped-questions/?session_num=1&session_types=3&sess_id=42
    """
    session_num = request.query_params.get("session_num")
    type_ids = request.query_params.get("session_types")
    sess_id = request.query_params.get("sess_id")
    role_filter_flag = str(request.query_params.get("role_filter", "")).lower() in ("1", "true", "yes")

    if not session_num or not type_ids:
        return Response({"error": "session_num and session_types are required"}, status=400)

    try:
        type_ids = [int(t) for t in type_ids.split(",") if t.strip()]
    except ValueError:
        return Response({"error": "session_types must be a comma-separated list of integers"}, status=400)

    # Base queryset
    base_qs = SessionTypeQuestion.objects.filter(
        session_number=session_num,
        session_type__id__in=type_ids
    ).select_related("question", "question__ques_category", "session_type")

    # --- New logic: filter by assigned officials' roles if sess_id is given ---
    if sess_id:
        try:
            session = Session.objects.prefetch_related("assigned_official").get(pk=sess_id)
        except Session.DoesNotExist:
            return Response({"error": "Session not found"}, status=404)

        assigned_roles = list(
            session.assigned_official.values_list("of_role", flat=True)
        )

        # Filter to only questions belonging to any of these roles
        base_qs = base_qs.filter(
            Q(question__role__in=assigned_roles) |
            Q(question__ques_category__role__in=assigned_roles)
        )

    # --- Legacy role_filter=1 (filter by logged-in user role) ---
    elif role_filter_flag:
        user = request.user
        official = getattr(user, "official", None)
        user_role = getattr(official, "of_role", None)
        if not user_role:
            return Response({"error": "User has no official role to filter by"}, status=400)

        base_qs = base_qs.filter(
            Q(question__role__iexact=user_role) |
            Q(question__ques_category__role__iexact=user_role)
        )

    serializer = SessionTypeQuestionSerializer(base_qs, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request, sess_id):
    """
    POST: Marks a session as Ongoing for this specific official and hydrates mapped questions.
    Uses SessionProgress to track per-official start times.
    Includes robust error handling for missing imports, null mappings, or invalid data.
    """
    from django.db.models import Q  
    from django.utils import timezone

    user = request.user
    official = getattr(user, "official", None)

    if not official:
        return Response({"error": "User is not linked to any official profile."}, status=400)

    # --- Get session assigned to this official ---
    try:
        session = Session.objects.get(pk=sess_id, assigned_official=official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you."}, status=404)
    except Exception as e:
        return Response({"error": f"Unexpected error while fetching session: {str(e)}"}, status=500)

    # --- Ensure session is Ongoing ---
    try:
        if session.sess_status == "Pending":
            session.sess_status = "Ongoing"
            session.sess_date_today = timezone.now()
            session.save()
    except Exception as e:
        return Response({"error": f"Failed to update session status: {str(e)}"}, status=500)

    # --- Ensure progress record exists and mark start ---
    progress, _ = SessionProgress.objects.get_or_create(session=session, official=official)
    if not progress.started_at:
        progress.started_at = timezone.now()
        progress.is_done = False
        progress.save()

    # --- Hydrate mapped questions safely ---
    try:
        type_ids = list(session.sess_type.values_list("id", flat=True))
        user_role = official.of_role

        if session.sess_num == 1:
            # Shared session: all role questions
            all_mappings = SessionTypeQuestion.objects.filter(
                session_number=session.sess_num,
                session_type__id__in=type_ids
            ).select_related("question", "question__ques_category")
        else:
            # Individual session: role-filtered questions only
            all_mappings = SessionTypeQuestion.objects.filter(
                session_number=session.sess_num,
                session_type__id__in=type_ids
            ).filter(
                Q(question__role__iexact=user_role) |
                Q(question__ques_category__role__iexact=user_role)
            ).select_related("question", "question__ques_category")

        # Create SessionQuestion entries safely (skip null questions)
        for m in all_mappings:
            if not m.question:
                continue  # Skip invalid mapping rows with no linked question
            SessionQuestion.objects.get_or_create(
                session=session,
                question=m.question,
                defaults={"sq_is_required": False}
            )

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": f"Failed to hydrate mapped questions: {str(e)}"},
            status=500
        )

    # --- Serialize and respond ---
    try:
        serializer = SessionDetailSerializer(session, context={"request": request})
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response(
            {"error": f"Failed to serialize session data: {str(e)}"},
            status=500
        )

@api_view(["POST"]) 
@permission_classes([IsAuthenticated])
def add_custom_question(request, sess_id):
    """
    POST: Adds one or more ad-hoc (custom) questions to a session.
    Used by the 'Add Custom Questions' modal.
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

    return Response(SessionQuestionSerializer(created, many=True).data, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def finish_session(request, sess_id):
    """
    POST: Marks current official's session progress as Done.
    - Saves provided answers and records who answered them (answered_by, answered_at)
    - Enforces that an official can only answer questions matching their role (if mapped)
    - Marks SessionProgress for this official as done, and marks the overall session Done only
      when all assigned officials finished.
    """
    user = request.user
    if not hasattr(user, "official"):
        return Response({"error": "User is not an official"}, status=403)

    try:
        session = Session.objects.get(pk=sess_id, assigned_official=user.official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you"}, status=404)

    answers = request.data.get("answers", [])
    skipped = []  # collect any skipped answers due to role mismatch or missing sq
    saved = 0

    # Save answers inside a transaction to keep data consistent
    with transaction.atomic():
        for ans in answers:
            sq_id = ans.get("sq_id")
            if not sq_id:
                continue
            try:
                sq = SessionQuestion.objects.select_related("question").get(pk=sq_id, session=session)
            except SessionQuestion.DoesNotExist:
                skipped.append({"sq_id": sq_id, "reason": "not_found"})
                continue

            # Server-side role enforcement:
            q_role = None
            if sq.question:
                # prefer question.role (string), fallback to question.ques_category.role
                q_role = sq.question.role or getattr(sq.question.ques_category, "role", None)

            if q_role and user.official.of_role and q_role != user.official.of_role:
                # skip saving - not allowed for this official
                skipped.append({"sq_id": sq_id, "reason": "role_mismatch", "question_role": q_role})
                continue

            # Save the provided answer
            new_value = ans.get("value")
            new_note = ans.get("note")

            # Only update fields if they changed (optional optimization)
            changed = False
            if new_value is not None and new_value != sq.sq_value:
                sq.sq_value = new_value
                changed = True
            if new_note is not None and new_note != sq.sq_note:
                sq.sq_note = new_note
                changed = True

            # Always set who answered (even if they edited their previous answer)
            sq.answered_by = user.official
            sq.answered_at = timezone.now()

            # Save
            if changed or True:
                sq.save(update_fields=["sq_value", "sq_note", "answered_by", "answered_at"])
                saved += 1

        # Save description (if updated)
        description = request.data.get("sess_description")
        if description is not None:
            session.sess_description = description

        # Save selected services
        service_ids = request.data.get("services", [])
        if isinstance(service_ids, list):
            session.services_given.all().delete()
            for sid in service_ids:
                ServiceGiven.objects.create(
                    session=session,
                    serv_id_id=sid,
                    of_id=user.official
                )

        # Update this official’s progress
        progress, _ = SessionProgress.objects.get_or_create(
            session=session,
            official=user.official,
        )
        progress.is_done = True
        progress.finished_at = timezone.now()
        progress.save()

        # Update session status only after saving progress
        if session.all_officials_done():
            session.sess_status = "Done"
        else:
            session.sess_status = "Ongoing"
        session.save()

    all_finished = session.all_officials_done()

    # Return details including warnings about skipped answers
    return Response({
        "message": "Your session progress has been marked as done.",
        "saved_answers": saved,
        "skipped_answers": skipped,
        "session_completed": all_finished,
        "all_finished": all_finished,
        "session": SessionDetailSerializer(session, context={"request": request}).data
    }, status=200)

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
   
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def schedule_next_session(request):
    """
    Also supports simplified creation for Session 2+ (no schedule/location).
    """
    user = request.user
    official = getattr(user, "official", None)
    role = getattr(official, "of_role", None)

    if not official or not role:
        return Response({"error": "Only registered officials can access this endpoint."},
                        status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        sessions = Session.objects.filter(
            assigned_official=official,
            sess_status__in=["Pending", "Ongoing"]
        ).order_by("-sess_next_sched")
        serializer = SessionCRUDSerializer(sessions, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()

        # If frontend sends multiple officials → treat as shared session
        assigned_officials = data.get("assigned_official", None)

        # Ensure assigned_officials is a proper list of IDs
        if isinstance(assigned_officials, str):
            try:
                import json
                assigned_officials = json.loads(assigned_officials)
            except Exception:
                assigned_officials = [assigned_officials]

        if not assigned_officials:
            # fallback for individual sessions (Session 2+)
            assigned_officials = [official.pk]

        data["assigned_official"] = assigned_officials

        # Serialize and save the session
        serializer = SessionCRUDSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        # Create SessionProgress entries for all assigned officials
        for off_id in assigned_officials:
            try:
                off_obj = Official.objects.get(pk=off_id)
                SessionProgress.objects.get_or_create(session=session, official=off_obj)
            except Official.DoesNotExist:
                continue

        return Response(
            SessionCRUDSerializer(session, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_workers(request):
    """
    GET: Returns list of social workers for assignment (searchable by name).
    Used in NextSessionModal dropdown.
    """
    q = request.query_params.get("q", "").strip()
    workers = Official.objects.exclude(of_role="DSWD")
    
    # Python filter because fields are encrypted
    if q:
        workers = [w for w in workers if q.lower() in w.full_name.lower()]
    
    # Limit to first 20
    workers = workers[:20]
    
    data = [
        {
            "of_id": w.of_id,
            "full_name": w.full_name,
            "role": w.of_role,
            "contact": w.of_contact,
        }
        for w in workers
    ]
    
    return Response(data, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_service_categories(request):
    """GET: Returns all service categories for dropdown selection."""
    categories = ServiceCategory.objects.all()
    data = [{"id": c.id, "name": c.name} for c in categories]
    return Response(data, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def services_by_category(request, category_id):
    """GET: Returns all active services under a selected service category."""
    services = Services.objects.filter(
        category_id=category_id,
        is_active=True
    )
    serializer = ServicesSerializer(services, many=True)
    return Response(serializer.data, status=200)


# ==== Service ====
#scheduled_session_detail handles the display of the service

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def upload_service_proof(request, service_id):
    """
    PATCH: Upload service proof image and optional feedback.
    Accepts multipart form data.
    Automatically sets status to Done when proof is uploaded.
    """
    user = request.user
    try:
        service = ServiceGiven.objects.get(pk=service_id, of_id=user.official)
        # service = ServiceGiven.objects.get(pk=service_id)  # if allow admin edits
    except ServiceGiven.DoesNotExist:
        return Response({"error": "Service record not found or not assigned to you."}, status=404)

    data = request.data.copy()
    data["service_status"] = "Done"  #  automatically mark as Done

    serializer = ServiceGivenSerializer(service, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)

#========================================SESSION 2====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def incident_summary(request, incident_id):
    """
    Returns a summarized view of an incident including:
    - Incident number
    - Victim name
    - Next session number (auto computed per role)
    - Used by CreateSession (Session 2+)
    """
    try:
        incident = IncidentInformation.objects.select_related("vic_id").get(pk=incident_id)
    except IncidentInformation.DoesNotExist:
        return Response({"error": "Incident not found"}, status=404)

    # --- Determine current official & role ---
    user = request.user
    official = getattr(user, "official", None)
    role = getattr(official, "of_role", None)

    # --- Compute next session number ---
    if not role:
        # fallback to global numbering if no role (should not happen for officials)
        last_session = incident.sessions.order_by("-sess_num").first()
        next_num = (last_session.sess_num + 1) if last_session else 1
    else:
        # filter sessions by role to compute independent numbering
        last_role_session = (
            Session.objects.filter(
                incident_id=incident,
                assigned_official__of_role=role
            )
            .order_by("-sess_num")
            .values_list("sess_num", flat=True)
            .first()
        )
        next_num = (last_role_session or 0) + 1

    # --- Build response ---
    return Response({
        "incident_id": incident.incident_id,
        "incident_num": incident.incident_num,
        "victim_name": incident.vic_id.full_name if incident.vic_id else None,
        "next_session_number": next_num,
    })


#=======================================CASES==============================================================

class SocialWorkerCaseList(generics.ListAPIView):
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        official = getattr(user, "official", None)
        role = getattr(official, "of_role", None)
        if not role:
            return IncidentInformation.objects.none()

        return IncidentInformation.objects.filter(
            sessions__assigned_official=official,
            incident_status__in=["Pending", "Ongoing"]
        ).distinct()


# ==================================== SOCIAL WORKER SCHEDULE  ================================
class OfficialAvailabilityViewSet(viewsets.ModelViewSet):
    """
    Manage recurring preferred working hours for logged-in Social Worker.
    - GET: List all availability for current user
    - POST: Add new availability
    - PUT/PATCH: Edit availability
    - DELETE: Deactivate availability (set is_active=False)
    """
    serializer_class = OfficialAvailabilitySerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["Social Worker"]

    def get_queryset(self):
        user = self.request.user
        official = getattr(user, "official", None)
        if not official:
            return OfficialAvailability.objects.none()
        return OfficialAvailability.objects.filter(official=official)


    def destroy(self, request, *args, **kwargs):
        """Soft delete: deactivate instead of removing."""
        instance = self.get_object()
        if instance.official != request.user.official:
            return Response({"detail": "You can only deactivate your own availability."}, status=403)
        instance.is_active = False
        instance.save()
        return Response({"detail": "Availability deactivated successfully."}, status=200)

    @action(detail=True, methods=["patch"], url_path="reactivate")
    def reactivate(self, request, pk=None):
        """Re-enable a previously deactivated availability."""
        instance = self.get_object()
        if instance.official != request.user.official:
            return Response({"detail": "You can only reactivate your own availability."}, status=403)
        instance.is_active = True
        instance.save()
        return Response({"detail": "Availability reactivated successfully."}, status=200)

class OfficialUnavailabilityViewSet(viewsets.ModelViewSet):

    """
    Manage temporary unavailability records (like sick leave or holidays) for the current Social Worker.
    """
    serializer_class = OfficialUnavailabilitySerializer
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["Social Worker"]

    def get_queryset(self):
        user = self.request.user
        official = getattr(user, "official", None)
        if not official:
            return OfficialUnavailability.objects.none()
        return OfficialUnavailability.objects.filter(official=official)

class OfficialScheduleOverviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["Social Worker", "Nurse", "Psychometrician", "Home Life"]

    @action(detail=False, methods=["get"])
    def week(self, request):
        """
        Returns combined availability and unavailability for the selected week.
        Query params: ?start_date=YYYY-MM-DD
        """
        user = request.user
        if not hasattr(user, "official"):
            return Response({"detail": "Not linked to an official."}, status=400)

        official = user.official
        start_str = request.query_params.get("start_date")
        if not start_str:
            return Response({"detail": "start_date required"}, status=400)

        try:
            start_date = date.fromisoformat(start_str)
        except ValueError:
            return Response({"detail": "Invalid start_date format"}, status=400)

        end_date = start_date + timedelta(days=6)

        # recurring pattern
        availabilities = OfficialAvailability.objects.filter(
            official=official
        ).values("id", "day_of_week", "start_time", "end_time", "remarks", "is_active")

        # temporary blocks
        unavailabilities = OfficialUnavailability.objects.filter(
            official=official,
            start_date__lte=end_date,
            end_date__gte=start_date,
        ).values("start_date", "end_date", "reason", "notes")

        return Response({
            "start_date": start_date,
            "end_date": end_date,
            "availabilities": list(availabilities),
            "unavailabilities": list(unavailabilities),
        })

#=====================================QUESTIONS============================================

# CATEGORY LIST 
class QuestionCategoryListView(generics.ListAPIView):
    """Return only active categories for the current official’s role."""
    serializer_class = QuestionCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        official = getattr(self.request.user, "official", None)
        if not official:
            return QuestionCategory.objects.none()
        return QuestionCategory.objects.filter(role=official.of_role, is_active=True)

#  QUESTION LIST / CREATE 
class QuestionListCreateView(generics.ListCreateAPIView):
    """Social worker can list or create their own questions."""
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        official = getattr(self.request.user, "official", None)
        if not official:
            return Question.objects.none()
        # Only show questions made by same role
        return Question.objects.filter(role=official.of_role).order_by("-created_at")

    def perform_create(self, serializer):
        instance = serializer.save()
        log_change(
            user=self.request.user,
            model_name="Question",
            record_id=instance.ques_id,
            action="CREATE",
            description=f"Created new question: {instance.ques_question_text}",
        )

# QUESTION DETAIL (UPDATE / TOGGLE ACTIVE)
class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        """Toggle question activation (soft deactivate/activate)."""
        question = self.get_object()

        # Toggle active state
        question.ques_is_active = not question.ques_is_active
        question.save(update_fields=["ques_is_active"])

        # Build readable message
        action_text = "activated" if question.ques_is_active else "deactivated"
        description = f"Question {action_text}: '{question.ques_question_text}'"

        # Log this change
        log_change(
            user=request.user,
            model_name="Question",
            record_id=question.ques_id,
            action="DELETE",  # Keep consistent with DSWD’s system
            description=description,
            old_data={"ques_is_active": not question.ques_is_active},
            new_data={"ques_is_active": question.ques_is_active},
        )

        return Response(
            {"message": f"Question {action_text} successfully."},
            status=status.HTTP_200_OK,
        )
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Prepare old data
        old_data = {
            "ques_category": instance.ques_category_id,
            "ques_question_text": instance.ques_question_text,
            "ques_answer_type": instance.ques_answer_type,
        }

        # Apply new values
        updated_fields = {**old_data, **serializer.validated_data}

        # Normalize category to int if possible (avoid "1" vs 1 mismatch)
        if "ques_category" in updated_fields and updated_fields["ques_category"] is not None:
            updated_fields["ques_category"] = (
                int(updated_fields["ques_category"])
                if isinstance(updated_fields["ques_category"], str)
                else updated_fields["ques_category"].id
                if hasattr(updated_fields["ques_category"], "id")
                else updated_fields["ques_category"]
            )

        # Detect real changes
        changes_detected = any(
            old_data[field] != updated_fields[field] for field in old_data
        )

        if not changes_detected:
            return Response(
                {"detail": "No changes detected — update skipped."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save and log only if changed
        updated_instance = serializer.save()

        field_labels = {
            "ques_category": "Category",
            "ques_question_text": "Question Text",
            "ques_answer_type": "Answer Type",
        }

        changes = []
        for field in old_data:
            if old_data[field] != updated_fields[field]:
                old_val = old_data[field]
                new_val = updated_fields[field]

                if field == "ques_category":
                    old_val = (
                        QuestionCategory.objects.filter(id=old_val).first().name
                        if old_val else "(None)"
                    )
                    new_val = (
                        QuestionCategory.objects.filter(id=new_val).first().name
                        if new_val else "(None)"
                    )
                changes.append(f"• {field_labels[field]} changed from '{old_val}' → '{new_val}'")

        description = "\n".join(changes) or "Updated question fields."

        log_change(
            user=request.user,
            model_name="Question",
            record_id=updated_instance.ques_id,
            action="UPDATE",
            description=description,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
# CHOICES (for AddQuestion modal)
class QuestionChoicesView(APIView):
    """Return categories and answer types for the logged-in official’s role."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        official = getattr(request.user, "official", None)
        role = getattr(official, "of_role", None)
        categories = QuestionCategory.objects.filter(role=role, is_active=True)
        answer_types = [a[0] for a in Question.ANSWER_TYPES]
        return Response({
            "categories": QuestionCategorySerializer(categories, many=True).data,
            "answer_types": answer_types,
        })

#  SESSION TYPE LIST 
class SessionTypeListView(generics.ListAPIView):
    """Return all session types for dropdowns."""
    queryset = SessionType.objects.all()
    serializer_class = SessionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

#  SESSION TYPE QUESTION MAPPING 
class SessionTypeQuestionListCreateView(generics.ListCreateAPIView):
    """Assign questions to session types and numbers."""
    queryset = SessionTypeQuestion.objects.all()
    serializer_class = SessionTypeQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class BulkQuestionCreateAndAssignView(generics.CreateAPIView):
    """
    POST: Create multiple questions under a single category and immediately assign them to sessions.
    """
    serializer_class = BulkQuestionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        created_questions = serializer.save()

        return Response(
            QuestionSerializer(created_questions, many=True).data,
            status=201
        )

class BulkAssignView(APIView):
    """
    POST: Bulk assign multiple questions to multiple session types and session numbers.
    Automatically replaces old mappings with new ones.
    Logs the reassignment for auditing.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = BulkAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        questions = serializer.validated_data["questions"]
        session_numbers = serializer.validated_data["session_numbers"]
        session_types = serializer.validated_data["session_types"]

        created_mappings = []

        for q_id in questions:
            # Get existing mappings
            old_mappings = SessionTypeQuestion.objects.filter(question_id=q_id)
            old_numbers = sorted(set(old_mappings.values_list("session_number", flat=True)))
            old_type_ids = sorted(set(old_mappings.values_list("session_type_id", flat=True)))
            old_type_names = list(
                SessionType.objects.filter(id__in=old_type_ids).values_list("name", flat=True)
            )

            had_old_assignments = old_mappings.exists()

            # Delete old mappings
            old_mappings.delete()

            # Create new mappings
            for num in session_numbers:
                for st_id in session_types:
                    mapping = SessionTypeQuestion.objects.create(
                        session_number=num,
                        session_type_id=st_id,
                        question_id=q_id,
                    )
                    created_mappings.append(mapping)

            # Skip logging if first time assignment
            if not had_old_assignments:
                continue

            # Fetch new readable data
            new_type_names = list(
                SessionType.objects.filter(id__in=session_types).values_list("name", flat=True)
            )

            added_numbers = [n for n in session_numbers if n not in old_numbers]
            removed_numbers = [n for n in old_numbers if n not in session_numbers]
            added_types = [t for t in new_type_names if t not in old_type_names]
            removed_types = [t for t in old_type_names if t not in new_type_names]

            # Build readable log
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

            # Log the reassignment
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

        return Response(
            SessionTypeQuestionSerializer(created_mappings, many=True).data,
            status=201
        )

class ChangeLogListView(generics.ListAPIView):
    """
    Returns all change logs related to the logged-in role.
    - DSWD sees all.
    - Officials (e.g., Social Workers) see only logs they created or logs affecting their role.
    """
    serializer_class = ChangeLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        official = getattr(user, "official", None)
        if not official:
            return ChangeLog.objects.none()

        # DSWD can see everything
        if official.of_role == "DSWD":
            return ChangeLog.objects.all()

        # Role-based filtering:
        #  - Only show logs related to this official's role (Question, SessionTypeQuestion)
        #  - OR logs created by this specific official
        return ChangeLog.objects.filter(
            models.Q(user=official)
            | models.Q(model_name__in=["Question", "SessionTypeQuestion"])
            & models.Q(user__of_role=official.of_role)
        ).select_related("user")


#==========================================================================



#para ni sa file encryption kay diri naka store ang incident_evidence,ug ang victim_face_samples
class ServeEvidenceFileView(APIView):
    permission_classes = [AllowAny]


    def get(self, request, evidence_id):
        try:
            evidence = Evidence.objects.get(id=evidence_id)
        except Evidence.DoesNotExist:
            raise Http404("Evidence not found")
        return serve_encrypted_file(request, evidence, evidence.file)

class ServeVictimFacePhotoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, sample_id):
        try:
            sample = VictimFaceSample.objects.get(id=sample_id)
        except VictimFaceSample.DoesNotExist:
            raise Http404("Victim face sample not found")
        return serve_encrypted_file(request, sample, sample.photo, content_type='image/jpeg')