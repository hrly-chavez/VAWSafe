from rest_framework import serializers
from shared_model.models import *
from datetime import date
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, time
from rest_framework.exceptions import ValidationError
from dswd.utils.logging import log_change

# --- Lightweight list serializer ---
class VictimListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()

    class Meta:
        model = Victim
        fields = ["vic_id", "vic_first_name", "vic_middle_name", "vic_last_name", 
                  "vic_extension", "vic_sex", "vic_birth_place", "age"]

    def get_age(self, obj):
        if obj.vic_birth_date:
            today = date.today()
            return (
                today.year
                - obj.vic_birth_date.year
                - ((today.month, today.day) < (obj.vic_birth_date.month, obj.vic_birth_date.day))
            )
        return None


# --- Nested detail serializers ---
class VictimFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimFaceSample
        fields = ["photo", "embedding"]  # embedding can be excluded if not needed

class VictimSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Victim
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.full_name
        
class PerpetratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perpetrator
        fields = "__all__"
        
class IncidentWithPerpetratorSerializer(serializers.ModelSerializer):
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)

    class Meta:
        model = IncidentInformation
        fields = "__all__"

class VictimDetailSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    incidents = IncidentWithPerpetratorSerializer(many=True, read_only=True)
    class Meta:
        model = Victim
        fields = "__all__"

    def get_age(self, obj):
        if obj.vic_birth_date:
            today = date.today()
            return (
                today.year
                - obj.vic_birth_date.year
                - ((today.month, today.day) < (obj.vic_birth_date.month, obj.vic_birth_date.day))
            )
        return None
#=====================================SESSIONS=============================================
class SocialWorkerSessionCRUDSerializer(serializers.ModelSerializer):
    """
    Handles creation and editing of session records.
    - Auto-increments session number per incident.
    - Includes related victim, case, and official names for display.
    - Used when scheduling next sessions.
    """
    victim_name = serializers.SerializerMethodField()
    case_no = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    official_names = serializers.SerializerMethodField() 
    sess_type = serializers.PrimaryKeyRelatedField(
        many=True, queryset=SessionType.objects.all()
    )
    assigned_official = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Official.objects.all(), required=False
    )

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "sess_date_today",
            "sess_location",
            "sess_description",
            "incident_id",
            "sess_type",
            "assigned_official",
            "victim_name",
            "case_no",
            "location",
            "official_names",
        ]
        read_only_fields = ["sess_id", "sess_num"]

    # --- Display helpers ---
    def get_victim_name(self, obj):
        if obj.incident_id and obj.incident_id.vic_id:
            return obj.incident_id.vic_id.full_name
        return None
    
    def get_case_no(self, obj):
        if obj.incident_id:
            return obj.incident_id.incident_num
        return None

    def get_location(self, obj):
        return obj.sess_location or "—"

    def get_official_names(self, obj):
        officials = obj.assigned_official.all()
        return [official.full_name for official in officials] if officials else []

    # --- Auto-increment session number when creating ---
    def create(self, validated_data):
        session_types = validated_data.pop("sess_type", [])
        officials = validated_data.pop("assigned_official", [])
        incident = validated_data.get("incident_id")

        if incident:
            last_num = (
                Session.objects.filter(incident_id=incident)
                .order_by("-sess_num")
                .values_list("sess_num", flat=True)
                .first()
            )
            validated_data["sess_num"] = (last_num or 0) + 1

        session = super().create(validated_data)
        session.sess_type.set(session_types)
        session.assigned_official.set(officials)
        return session

    def update(self, instance, validated_data):
        session_types = validated_data.pop("sess_type", None)
        officials = validated_data.pop("assigned_official", None)

        session = super().update(instance, validated_data)
        if session_types is not None:
            session.sess_type.set(session_types)
        if officials is not None:
            session.assigned_official.set(officials)
        return session

class SessionTypeSerializer(serializers.ModelSerializer):
    """Used to list or reference available session types (e.g., Counseling, Intake)."""
    class Meta:
        model = SessionType
        fields = ["id", "name"]

class SocialWorkerSessionSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for session list display.
    - Used in Social Worker session list endpoint.
    """
    victim_name = serializers.SerializerMethodField()
    case_no = serializers.SerializerMethodField()
    official_names = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "sess_type",
            "victim_name",
            "case_no",
            "official_names",
            "location",
        ]

    def get_victim_name(self, obj):
        if obj.incident_id and obj.incident_id.vic_id:
            return obj.incident_id.vic_id.full_name
        return None

    def get_case_no(self, obj):
        if obj.incident_id:
            return obj.incident_id.incident_num
        return None

    def get_official_names(self, obj):
        officials = obj.assigned_official.all()
        return [official.full_name for official in officials] if officials else []

    def get_location(self, obj):
        return obj.sess_location or None

class IncidentInformationSerializer(serializers.ModelSerializer): 
    """Displays incident info along with its linked sessions and perpetrator details."""

    sessions = SocialWorkerSessionSerializer(many=True, read_only=True)
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)  
    class Meta:
        model = IncidentInformation
        fields = "__all__"

class SocialWorkerSessionTypeQuestionSerializer(serializers.ModelSerializer): 
    """
    Serializer for mapped (template) questions per session type and number.
    - Used when previewing or hydrating session questions.
    """
    question_text = serializers.CharField(source="question.ques_question_text", read_only=True)
    question_category = serializers.CharField(source="question.ques_category", read_only=True)
    question_answer_type = serializers.CharField(source="question.ques_answer_type", read_only=True)

    class Meta:
        model = SessionTypeQuestion
        fields = [
            "id",
            "session_number",
            "session_type",
            "question",
            "question_text",
            "question_category",
            "question_answer_type",
        ]

class SocialWorkerSessionQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for actual session questions (hydrated).
    - Can include both mapped and custom questions.
    - Used when starting or answering a session.
    """
    question_text = serializers.CharField(source="question.ques_question_text", read_only=True)
    question_category = serializers.CharField(source="question.ques_category", read_only=True)
    question_answer_type = serializers.CharField(source="question.ques_answer_type", read_only=True)

    # new fields to expose who answered this question (if any)
    answered_by = serializers.IntegerField(source="answered_by.pk", read_only=True)
    answered_by_name = serializers.CharField(source="answered_by.full_name", read_only=True)
    answered_at = serializers.DateTimeField(read_only=True)

    # helpful computed flags
    is_answered = serializers.SerializerMethodField()
    assigned_role = serializers.SerializerMethodField()  # maps question.ques_category

    class Meta:
        model = SessionQuestion
        fields = [
            "sq_id",
            "question",
            "question_text",
            "question_category",
            "question_answer_type",
            "sq_custom_text",
            "sq_custom_answer_type",
            "sq_is_required",
            "sq_value",
            "sq_note",
            "answered_by",
            "answered_by_name",
            "answered_at",
            "is_answered",
            "assigned_role",
        ]

    def get_is_answered(self, obj):
        return obj.sq_value is not None and obj.sq_value != ""

    def get_assigned_role(self, obj):
        # If this is a mapped question, read ques_category; custom questions (question is None) return None
        try:
            return obj.question.ques_category if obj.question else None
        except Exception:
            return None
#=====SERVICES======
class ServicesSerializer(serializers.ModelSerializer):
    """Lists all available services or organizations under each category."""

    class Meta:
        model = Services
        fields = [
            "serv_id",
            "name",
            "category",
            "contact_person",
            "contact_number",
            "assigned_place",
            "service_address",
        ]

class ServiceGivenSerializer(serializers.ModelSerializer):
    """Displays a record of a specific service given during a session."""

    service = ServicesSerializer(source="serv_id", read_only=True)

    class Meta:
        model = ServiceGiven
        fields = [
            "id",
            "service",        
            "service_status",
            "service_pic",
            "service_feedback",
        ]
#===========
class SessionProgressSerializer(serializers.ModelSerializer):
    official = serializers.IntegerField(source="official.pk", read_only=True)
    official_name = serializers.CharField(source="official.full_name", read_only=True)
    official_role = serializers.CharField(source="official.of_role", read_only=True)  
    date_ended = serializers.DateTimeField(source="finished_at", read_only=True)

    class Meta:
        model = SessionProgress
        fields = [
            "official",
            "official_name",
            "official_role",   
            "started_at",
            "finished_at",
            "date_ended",
            "is_done",
            "notes",
        ]

class SocialWorkerSessionDetailSerializer(serializers.ModelSerializer): 
    """
    Full session detail serializer.
    - Used for viewing or updating session info.
    - Includes victim, incident, case, questions, and services given.
    - Adds 'my_progress' for the current logged-in official.
    """
    victim = VictimSerializer(source="incident_id.vic_id", read_only=True)
    incident = IncidentWithPerpetratorSerializer(source="incident_id", read_only=True)
    official_names = serializers.SerializerMethodField()
    sess_type = serializers.PrimaryKeyRelatedField(
        many=True, queryset=SessionType.objects.all(), write_only=True
    )
    sess_type_display = SessionTypeSerializer(source="sess_type", many=True, read_only=True)
    questions = SocialWorkerSessionQuestionSerializer(
        source="session_questions", many=True, read_only=True
    )
    services_given = ServiceGivenSerializer(many=True, read_only=True)
    progress = SessionProgressSerializer(many=True, read_only=True)
    my_progress = serializers.SerializerMethodField() 

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "sess_date_today",
            "sess_location",
            "sess_type",
            "sess_type_display",
            "sess_description",
            "victim",
            "incident",
            "official_names",
            "questions",
            "services_given",
            "progress",
            "my_progress",  # ← include new field
        ]

    def get_official_names(self, obj):
        officials = obj.assigned_official.all()
        return [official.full_name for official in officials] if officials else []

    def get_my_progress(self, obj):
        """Return current official's progress info if available."""
        request = self.context.get("request")
        if not request or not hasattr(request.user, "official"):
            return None
        progress = obj.progress.filter(official=request.user.official).first()
        return SessionProgressSerializer(progress).data if progress else None

class CloseCaseSerializer(serializers.ModelSerializer):
    """Used to mark a VAWC incident case as closed."""

    class Meta:
        model = IncidentInformation
        fields = ["incident_id", "incident_status"]
        read_only_fields = ["incident_id"]

    def validate(self, data):
        instance = self.instance
        if not instance:
            raise serializers.ValidationError("Incident not found")

        # Count sessions
        total_sessions = instance.sessions.count()
        if total_sessions < 2:
            raise serializers.ValidationError("Case cannot be closed before 2 sessions")

        return data

#=======================================CASES===============================================

class IncidentSerializer(serializers.ModelSerializer): #For case Column & Rows of Case

    victim_name = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    case_no = serializers.SerializerMethodField()
    official_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    vic_id = serializers.IntegerField(source="vic_id.vic_id", read_only=True)
    class Meta:
        model = IncidentInformation
        fields = [
            "incident_id",
            "case_no",
            "incident_status",
            "violence_type",
            "incident_date",
            "victim_name",
            "gender",
            "official_name",
            "location",
            "vic_id",
        ]

    def get_victim_name(self, obj):
        return obj.vic_id.full_name if obj.vic_id else None

    def get_gender(self, obj):
        return obj.vic_id.vic_sex if obj.vic_id else None

    def get_case_no(self, obj):
        return obj.incident_num or obj.incident_id

    def get_official_name(self, obj):
        return obj.of_id.full_name if obj.of_id else None

    def get_location(self, obj):
        return obj.incident_location or None
    
# ===================================== SCHEDULING =====================================

class OfficialAvailabilitySerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = OfficialAvailability
        fields = '__all__'

    def validate(self, data):
        #Ensure valid time range and prevent overlap for same official/day.
        user = self.context["request"].user
        official = getattr(user, "official", None)
        if not official:
            raise ValidationError("Only officials can create availability records.")

        start_time = data.get("start_time")
        end_time = data.get("end_time")
        day_of_week = data.get("day_of_week")

        if start_time >= end_time:
            raise ValidationError("End time must be after start time.")

        # Overlap check
        existing = OfficialAvailability.objects.filter(
            official=official, day_of_week=day_of_week, is_active=True
        )
        if self.instance:
            existing = existing.exclude(id=self.instance.id)

        for avail in existing:
            if (start_time < avail.end_time and end_time > avail.start_time):
                raise ValidationError(f"Overlaps with existing slot {avail.start_time}-{avail.end_time} on {avail.day_of_week}.")

        return data

    def create(self, validated_data):
        validated_data["official"] = self.context["request"].user.official
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Only allow editing within own record
        request = self.context["request"]
        if instance.official != request.user.official:
            raise ValidationError("You can only update your own schedule.")
        return super().update(instance, validated_data)

class OfficialUnavailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficialUnavailability
        fields = '__all__'

    def validate(self, data):
        #Ensure valid date range and no overlap with existing unavailability."""
        user = self.context["request"].user
        official = getattr(user, "official", None)
        if not official:
            raise ValidationError("Only officials can create unavailability records.")

        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date > end_date:
            raise ValidationError("End date must be after start date.")

        # Check overlap
        existing = OfficialUnavailability.objects.filter(official=official)
        if self.instance:
            existing = existing.exclude(id=self.instance.id)

        for u in existing:
            if (start_date <= u.end_date and end_date >= u.start_date):
                raise ValidationError(
                    f"Overlaps with existing unavailability ({u.start_date} - {u.end_date}, {u.reason})."
                )

        return data

    def create(self, validated_data):
        validated_data["official"] = self.context["request"].user.official
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context["request"]
        if instance.official != request.user.official:
            raise ValidationError("You can only update your own unavailability.")
        return super().update(instance, validated_data)
    

#=========================QUESTIONS================================

#  CATEGORY SERIALIZER 
class QuestionCategorySerializer(serializers.ModelSerializer):
    """For displaying role-specific question categories."""

    class Meta:
        model = QuestionCategory
        fields = ["id", "name", "description", "role", "is_active"]

#  QUESTION SERIALIZER
class QuestionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    category_name = serializers.CharField(source="ques_category.name", read_only=True)
    mappings = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = "__all__"
        read_only_fields = ["ques_id", "created_at", "created_by_name", "role"]

    def get_mappings(self, obj):
        """Return all session mappings for this question."""
        return [
            {
                "session_number": m.session_number,
                "session_type": m.session_type.name,
                "session_type_id": m.session_type.id,
            }
            for m in obj.type_questions.all()
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        official = getattr(request.user, "official", None)
        validated_data["created_by"] = official
        validated_data["role"] = official.of_role if official else "Unknown"
        return super().create(validated_data)

# SESSION TYPE (for assignment modal)
class SessionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionType
        fields = ["id", "name"]

# SESSION TYPE QUESTION (assignment link) 
class SessionTypeQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.ques_question_text", read_only=True)
    session_type_name = serializers.CharField(source="session_type.name", read_only=True)

    class Meta:
        model = SessionTypeQuestion
        fields = [
            "id",
            "session_number",
            "session_type",
            "session_type_name",
            "question",
            "question_text",
        ]

class BulkQuestionCreateSerializer(serializers.Serializer):
    """
    Bulk creation of multiple questions under one chosen category.
    Automatically assigns created questions to specified session types and numbers.
    """
    category_id = serializers.IntegerField(required=True)
    questions = serializers.ListField(
        child=serializers.DictField(), allow_empty=False
    )
    session_numbers = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False
    )
    session_types = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

    def create(self, validated_data):
        request = self.context.get("request")
        official = getattr(request.user, "official", None)
        category_id = validated_data["category_id"]
        questions_data = validated_data["questions"]
        session_numbers = validated_data["session_numbers"]
        session_types = validated_data["session_types"]

        created_questions = []

        for q in questions_data:
            question = Question.objects.create(
                ques_category_id=category_id,
                ques_question_text=q.get("ques_question_text"),
                ques_answer_type=q.get("ques_answer_type"),
                ques_is_active=True,
                created_by=official,
                role=official.of_role if official else "Unknown",
            )
            created_questions.append(question)

        # --- Automatically assign all new questions to the chosen sessions ---
        for question in created_questions:
            for sess_num in session_numbers:
                for st_id in session_types:
                    SessionTypeQuestion.objects.create(
                        session_number=sess_num,
                        session_type_id=st_id,
                        question=question,
                    )

        # Log the entire bulk creation action
        for q in created_questions:
            log_change(
                user=request.user,
                model_name="Question",
                record_id=q.ques_id,
                action="CREATE",
                description=f"Bulk-created question '{q.ques_question_text}' and assigned to sessions.",
            )

        return created_questions

class BulkAssignSerializer(serializers.Serializer):
    """
    For edit and changelogs
    Used for bulk assigning questions to multiple session types and numbers.
    Accepts lists of question IDs, session numbers, and session type IDs.
    """
    questions = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )
    session_numbers = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False
    )
    session_types = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

#Logs
class ChangeLogSerializer(serializers.ModelSerializer):
    """Displays detailed logs of changes made by officials."""
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ChangeLog
        fields = "__all__"
