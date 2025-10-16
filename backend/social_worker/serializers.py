from rest_framework import serializers
from shared_model.models import *
from datetime import date
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, time
from rest_framework.exceptions import ValidationError
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
        
class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = "__all__"

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
    case_report = CaseReportSerializer(read_only=True)
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
    official_name = serializers.SerializerMethodField()
    sess_type = serializers.PrimaryKeyRelatedField(many=True, queryset=SessionType.objects.all())
    assigned_official = serializers.PrimaryKeyRelatedField(queryset=Official.objects.all(), required=True)

    class Meta:
        model = Session
        fields = "__all__"
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

    def get_official_name(self, obj):
        return obj.assigned_official.full_name if obj.assigned_official else None

    # --- Auto-increment session number when creating ---
    def create(self, validated_data):
        session_types = validated_data.pop("sess_type", [])
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
        return session
      # --- Update session and its related types ---
    def update(self, instance, validated_data):
        session_types = validated_data.pop("sess_type", None)
        session = super().update(instance, validated_data)
        if session_types is not None:
            session.sess_type.set(session_types)
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
    official_name = serializers.SerializerMethodField()
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
            "official_name",
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

    def get_official_name(self, obj):
        return obj.assigned_official.full_name if obj.assigned_official else None

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

    class Meta:
        model = SessionQuestion
        fields = [
            "sq_id",
            "question",
            "question_text",    
            "question_category",
            "question_answer_type",
            "sq_custom_text",        #for ad-hoc questions
            "sq_custom_answer_type",
            "sq_is_required",
            "sq_value",
            "sq_note",
        ]
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
class SocialWorkerSessionDetailSerializer(serializers.ModelSerializer): 
    """
    Full session detail serializer.
    - Used for viewing or updating session info.
    - Includes victim, incident, case, questions, and services given.
    """
    victim = VictimSerializer(source="incident_id.vic_id", read_only=True)
    incident = IncidentWithPerpetratorSerializer(source="incident_id", read_only=True)
    case_report = CaseReportSerializer(source="incident_id.vic_id.case_report", read_only=True)
    official_name = serializers.CharField(source="assigned_official.full_name", read_only=True)
    sess_type = serializers.PrimaryKeyRelatedField(many=True, queryset=SessionType.objects.all(),write_only=True) #  Accept IDs for update
    sess_type_display = SessionTypeSerializer(source="sess_type", many=True, read_only=True)
    questions = SocialWorkerSessionQuestionSerializer(source="session_questions", many=True, read_only=True)
    services_given = ServiceGivenSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "sess_date_today",
            "sess_location",
            "sess_type",           # for PATCH/PUT (IDs only)
            "sess_type_display",   # for GET (id + name)
            "sess_description",
            "victim",
            "incident",
            "case_report",
            "official_name",
            "questions",
            "services_given",
        ]

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

#=======================================CASES==========================================================

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
        fields = ["id", "day_of_week", "day_display", "start_time", "end_time", "remarks", "is_active"]

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
        fields = ["id", "start_date", "end_date", "reason", "notes"]

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
    