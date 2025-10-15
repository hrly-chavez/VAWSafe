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
from rest_framework import viewsets
from datetime import date, timedelta
from rest_framework.decorators import action


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
    """
    GET: List all sessions (Pending & Ongoing) assigned to the logged-in social worker.
    Used for the main Sessions page.
    """
    serializer_class = SocialWorkerSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "official") and user.official.of_role == "Social Worker":
            return Session.objects.filter(
                assigned_official=user.official,
                sess_status__in=["Pending", "Ongoing"]  
            ).order_by("sess_status", "sess_next_sched")   
        return Session.objects.none()

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
    POST: Marks a session as Ongoing and hydrates mapped questions into SessionQuestion records.
    Used when a social worker starts a pending session.
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
    POST: Saves all answers, updates services and description, and marks session as Done.
    Triggered when the social worker finishes a session.
    """
    user = request.user
    try:
        session = Session.objects.get(pk=sess_id, assigned_official=user.official)
    except Session.DoesNotExist:
        return Response({"error": "Session not found or not assigned to you"}, status=404)

    # Save answers
    answers = request.data.get("answers", [])
    for ans in answers:
        try:
            sq = SessionQuestion.objects.get(pk=ans["sq_id"], session=session)
            sq.sq_value = ans.get("value")
            sq.sq_note = ans.get("note")
            sq.save()
        except SessionQuestion.DoesNotExist:
            continue

    # Save description
    description = request.data.get("sess_description")
    if description is not None:
        session.sess_description = description

    # Save selected services
    service_ids = request.data.get("services", [])
    if isinstance(service_ids, list):
        # clear old ones
        session.services_given.all().delete()
        # create new
        for sid in service_ids:
            ServiceGiven.objects.create(
                session=session,
                serv_id_id=sid,
                of_id=user.official
            )

    # Mark as Done
    session.sess_status = "Done"
    session.save()

    return Response({"message": "Session finished successfully!"}, status=200)


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
def list_social_workers(request):
    """
    GET: Returns list of social workers for assignment (searchable by name).
    Used in NextSessionModal dropdown.
    """
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
def update_service_feedback(request, service_id):
    """
    PATCH: Updates feedback for a specific service given.
    Example: PATCH /api/social_worker/services/<service_id>/
    Body: { "service_feedback": "Victim successfully assisted by PNP." }
    """
    user = request.user
    try:
        service = ServiceGiven.objects.get(pk=service_id, of_id=user.official)
        #service = ServiceGiven.objects.get(pk=service_id) if want to let others update
    except ServiceGiven.DoesNotExist:
        return Response({"error": "Service record not found or not assigned to you."}, status=404)

    serializer = ServiceGivenSerializer(service, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)

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

