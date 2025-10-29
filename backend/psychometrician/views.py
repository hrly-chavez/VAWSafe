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
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework import viewsets
from rest_framework.decorators import action
from dswd.utils.logging import log_change

 
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
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['Social Worker']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return Victim.objects.filter(
                incidents__sessions__assigned_official=user.official
            ).distinct()
        return Victim.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Get the victim object
        victim = self.get_object()

        decrypted_photo_path = None

        # Check if the vic_photo is encrypted
        if victim.vic_photo.name.endswith('.enc'):
            try:
                # Decrypt the photo
                logger.info(f"Decrypting photo for victim {victim.vic_id}")
                fernet = Fernet(settings.FERNET_KEY)
                with open(victim.vic_photo.path, "rb") as enc_file:
                    encrypted_data = enc_file.read()

                decrypted_data = fernet.decrypt(encrypted_data)

                # Save the decrypted data to the MEDIA_ROOT directory temporarily
                decrypted_photo_path = os.path.join(settings.MEDIA_ROOT, f"decrypted_{victim.vic_id}.jpg")
                with open(decrypted_photo_path, 'wb') as decrypted_file:
                    decrypted_file.write(decrypted_data)

                # Update the victim's photo to the temporary decrypted file path
                victim.vic_photo.name = os.path.relpath(decrypted_photo_path, settings.MEDIA_ROOT)

            except Exception as e:
                logger.error(f"Failed to decrypt photo for victim {victim.vic_id}: {e}")
                return Response({"error": f"Failed to decrypt photo: {str(e)}"}, status=400)

        # Use the serializer to return the victim data
        serializer = self.get_serializer(victim)

        # Start a background thread to delete the decrypted file after 10 seconds
        if decrypted_photo_path:
            threading.Thread(target=cleanup_decrypted_file_later, args=(decrypted_photo_path, victim.vic_id, 10)).start()

        # Return the victim data immediately
        return Response(serializer.data)

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
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['Social Worker']

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
            for sample in VictimFaceSample.objects.select_related("victim"):
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
    serializer_class = SocialWorkerSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "official") or user.official.of_role != "Social Worker":
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
    serializer_class = SocialWorkerSessionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            # Allow access to all sessions under incidents where this social worker
            # is assigned to at least one session
            return Session.objects.filter(
                incident_id__sessions__assigned_official=user.official
            ).distinct()
        return Session.objects.none()

class SessionTypeListView(generics.ListAPIView):
    """GET: List all available session types for dropdowns."""
    queryset = SessionType.objects.all()
    serializer_class = SessionTypeSerializer
    permission_classes = [IsAuthenticated]

#Session Start 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def social_worker_mapped_questions(request):
    """
    GET: Returns mapped questions for a specific session number and session type(s).
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
    POST: Marks a session as Ongoing for this specific official and hydrates mapped questions.
    Uses SessionProgress to track per-official start times.
    """
    user = request.user
    official = user.official

    # --- Get session assigned to this official ---
    try:
        session = Session.objects.get(pk=sess_id, assigned_official=official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you"}, status=404)

    # --- Ensure session is Ongoing ---
    if session.sess_status == "Pending":
        session.sess_status = "Ongoing"
        session.sess_date_today = timezone.now()
        session.save()

    # --- Ensure progress record exists and mark start ---
    progress, _ = SessionProgress.objects.get_or_create(session=session, official=official)
    if not progress.started_at:
        progress.started_at = timezone.now()
        progress.is_done = False
        progress.save()

    # --- Hydrate mapped questions ---
    type_ids = list(session.sess_type.values_list("id", flat=True))

    # We cannot query EncryptedCharField directly, so we fetch all then filter manually
    all_mappings = SessionTypeQuestion.objects.filter(
        session_number=session.sess_num,
        session_type__id__in=type_ids
    ).select_related("question")

    # Filter only those questions that match the official's role
    filtered_mappings = [
        m for m in all_mappings
        if getattr(m.question, "ques_category", None) == official.of_role
    ]

    print("Official role:", official.of_role)
    print("Filtered question roles:", [m.question.ques_category for m in filtered_mappings])
    print("Session number:", session.sess_num)
    print("Session types:", type_ids)

    # Create SessionQuestion entries for relevant mapped questions
    for m in filtered_mappings:
        SessionQuestion.objects.get_or_create(
            session=session,
            question=m.question,
            defaults={"sq_is_required": False}
        )

    # --- Serialize and respond ---
    serializer = SocialWorkerSessionDetailSerializer(session, context={"request": request})
    return Response(serializer.data, status=200)

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

    return Response(SocialWorkerSessionQuestionSerializer(created, many=True).data, status=201)

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
            # If the question is a mapped question and its category (role) doesn't match the official's role, skip saving.
            q_role = None
            if sq.question:
                q_role = sq.question.ques_category

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
        "session": SocialWorkerSessionDetailSerializer(session, context={"request": request}).data
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

#schedule session
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def schedule_next_session(request):
    """
    GET: Lists current sessions (Pending/Ongoing).
    POST: Creates a new session (schedules the next one).
    """
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
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            # include all, even inactive, so get_object() works for deactivation
            return OfficialAvailability.objects.filter(official=user.official)
        return OfficialAvailability.objects.none()


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
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return OfficialUnavailability.objects.filter(official=user.official)
        return OfficialUnavailability.objects.none()

class OfficialScheduleOverviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["Social Worker"]

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

    def perform_update(self, serializer):
        instance = serializer.save()
        log_change(
            user=self.request.user,
            model_name="Question",
            record_id=instance.ques_id,
            action="UPDATE",
            description=f"Updated question: {instance.ques_question_text}",
        )

    def delete(self, request, *args, **kwargs):
        question = self.get_object()
        question.ques_is_active = not question.ques_is_active
        question.save(update_fields=["ques_is_active"])

        log_change(
            user=request.user,
            model_name="Question",
            record_id=question.ques_id,
            action="DELETE",
            description=f"Question {'activated' if question.ques_is_active else 'deactivated'}.",
        )

        return Response(
            {"message": f"Question {'activated' if question.ques_is_active else 'deactivated'} successfully."},
            status=200
        )


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