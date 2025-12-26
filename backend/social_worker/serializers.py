from django.urls import reverse
from rest_framework import serializers
from shared_model.models import *
from datetime import date
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, time
from rest_framework.exceptions import ValidationError
from dswd.utils.logging import log_change
from django.db.models import Q
from .sanitize import sanitize_text

# wait

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "province", "municipality", "barangay", "sitio", "street"]

    def to_representation(self, instance):
        parts = []
        if instance.street:
            parts.append(str(instance.street))
        if instance.sitio:
            parts.append(str(instance.sitio))
        if instance.barangay:
            parts.append(str(instance.barangay))
        if instance.municipality:
            parts.append(str(instance.municipality))
        if instance.province:
            parts.append(str(instance.province))
        return ", ".join(parts) or "—"

# --- Nested detail serializers ---
class VictimFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimFaceSample
        fields = ["photo", "embedding"]  # embedding can be excluded if not needed

class VictimSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    address = AddressSerializer()

    class Meta:
        model = Victim
        fields = "__all__"

    def get_age(self, obj):
        return obj.age

    def get_full_name(self, obj):
        return obj.full_name
    
    def create(self, validated_data):
        address_data = validated_data.pop("address")
        address = Address.objects.create(**address_data)
        victim = Victim.objects.create(address=address, **validated_data)
        return victim
    
    def validate(self, data):
        for field, value in data.items():
            data[field] = sanitize_text(value)
        return data

class FamilyMemberSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = FamilyMember
        fields = "__all__"  # or list all fields explicitly

    def get_age(self, obj):
        if obj.fam_birth_date:
            today = date.today()
            born = obj.fam_birth_date
            return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
        return None
    
    def get_full_name(self, obj):
        parts = [obj.fam_fname, obj.fam_mname, obj.fam_lname, obj.fam_extension]
        # Join non-empty parts with space
        return " ".join(filter(None, parts))
    
    def validate(self, data):
        for field, value in data.items():
            data[field] = sanitize_text(value)
        return data

class ContactPersonSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField() 
    
    class Meta:
        model = ContactPerson
        fields = "__all__"

    def get_age(self, obj):
        if obj.cont_birth_date:
            today = date.today()
            return (
                today.year
                - obj.cont_birth_date.year
                - ((today.month, today.day) < (obj.cont_birth_date.month, obj.cont_birth_date.day))
            )
        return None
    
    def get_full_name(self, obj):
        return obj.full_name  # uses your model property
    
    def validate(self, data):
        for field, value in data.items():
            data[field] = sanitize_text(value)
        return data

class PerpetratorSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()

    class Meta:
        model = Perpetrator
        fields = "__all__"

    def get_age(self, obj):
        if obj.per_birth_date:
            today = date.today()
            return (
                today.year
                - obj.per_birth_date.year
                - ((today.month, today.day) < (obj.per_birth_date.month, obj.per_birth_date.day))
            )
        return None
    
    def validate(self, data):
        for field, value in data.items():
            data[field] = sanitize_text(value)
        return data
        
class IncidentWithPerpetratorSerializer(serializers.ModelSerializer):
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)

    class Meta:
        model = IncidentInformation
        fields = "__all__"

class VictimDetailSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    incidents = IncidentWithPerpetratorSerializer(many=True, read_only=True)
    contact_persons = serializers.SerializerMethodField()
    family_members = FamilyMemberSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    full_address = serializers.SerializerMethodField()  # <-- NEW FIELD

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
    
    def get_contact_persons(self, obj):
        # collect all contact persons for this victim's incidents
        contact_persons = ContactPerson.objects.filter(incident__vic_id=obj)
        return ContactPersonSerializer(contact_persons, many=True).data
    
    # --------------------------------------------------
    # 🔥 HELPER: Build full address string from serializer output
    # --------------------------------------------------
    def get_full_address(self, obj):
        address = obj.address
        if not address:
            return None

        parts = [
            address.street,
            address.sitio,
            address.barangay.name if address.barangay else None,
            address.municipality.name if address.municipality else None,
            address.province.name if address.province else None,
        ]

        return ", ".join([p for p in parts if p])
    
    def validate(self, data):
        for field, value in data.items():
            data[field] = sanitize_text(value)
        return data
#=====================================SESSIONS=============================================
class SessionCRUDSerializer(serializers.ModelSerializer):
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
    
    def validate(self, data):
        """
        Ensure valid role assignment and future schedule.
        """
        assigned_officials = data.get("assigned_official", [])
        sched_datetime = data.get("sess_next_sched")

        # --- Role uniqueness validation ---
        if hasattr(assigned_officials, "all"):
            assigned_officials = list(assigned_officials.all())

        if assigned_officials:
            roles = [off.of_role for off in assigned_officials if off.of_role]
            duplicates = [r for r in set(roles) if roles.count(r) > 1]
            if duplicates:
                raise serializers.ValidationError({
                    "assigned_official": (
                        f"Only one official per role is allowed per session. "
                        f"Duplicate role(s): {', '.join(duplicates)}."
                    )
                })

        # --- Require at least one assigned official ONLY for Session 1 ---
        is_create = self.instance is None
        incident = data.get("incident_id")

        if is_create and incident:
            existing_sessions = Session.objects.filter(incident_id=incident).count()

            if existing_sessions == 0 and not assigned_officials:
                raise serializers.ValidationError({
                    "assigned_official": "Please select at least one official for the intake session."
                })

        # --- Date/time validation (no past schedule) ---
        from django.utils import timezone
        if sched_datetime and sched_datetime < timezone.now():
            raise serializers.ValidationError({
                "sess_next_sched": "You cannot schedule a session in the past."
            })

        # --- Prevent scheduling conflicts within 30 minutes ---
        if sched_datetime:
            from datetime import timedelta

            conflict_window_start = sched_datetime - timedelta(minutes=30)
            conflict_window_end = sched_datetime + timedelta(minutes=30)

            current_session_id = None
            if self.instance:
                current_session_id = self.instance.pk

            # --- 1) Check conflict for SAME INCIDENT ---
            incident_obj = data.get("incident_id")  # renamed (FIXED)
            if incident_obj:
                qs = Session.objects.filter(
                    incident_id=incident_obj,
                    sess_status__in=["Pending", "Ongoing"],
                    sess_next_sched__range=[conflict_window_start, conflict_window_end],
                )

                if current_session_id:
                    qs = qs.exclude(pk=current_session_id)

                if qs.exists():
                    raise serializers.ValidationError({
                        "sess_next_sched":
                            "There is already a scheduled session within 30 minutes for this victim."
                    })

            # --- 2) Check conflict for ASSIGNED OFFICIALS ---
            if assigned_officials:
                qs = Session.objects.filter(
                    assigned_official__in=assigned_officials,
                    sess_status__in=["Pending", "Ongoing"],
                    sess_next_sched__range=[conflict_window_start, conflict_window_end],
                )

                if current_session_id:
                    qs = qs.exclude(pk=current_session_id)

                if qs.exists():
                    raise serializers.ValidationError({
                        "assigned_official":
                            "One of the assigned officials has another session within 30 minutes."
                    })

        return data



    # --- Auto-increment session number when creating (role-based logic) ---
    def create(self, validated_data):
        session_types = validated_data.pop("sess_type", [])
        officials = validated_data.pop("assigned_official", [])
        incident = validated_data.get("incident_id")

        # --- Identify current user and role ---
        request = self.context.get("request")
        official = getattr(request.user, "official", None)
        role = getattr(official, "of_role", None)

        if incident:
            # --- Detect shared session (multiple officials manually assigned) ---
            is_shared_session = len(officials) > 1

            if is_shared_session:
                validated_data["sess_num"] = 1
            else:
                # --- Role-based numbering ---
                if role:
                    last_num = (
                        Session.objects.filter(
                            incident_id=incident,
                            assigned_official__of_role=role
                        )
                        .order_by("-sess_num")
                        .values_list("sess_num", flat=True)
                        .first()
                    )
                    validated_data["sess_num"] = (last_num or 0) + 1
                else:
                    last_num = (
                        Session.objects.filter(incident_id=incident)
                        .order_by("-sess_num")
                        .values_list("sess_num", flat=True)
                        .first()
                    )
                    validated_data["sess_num"] = (last_num or 0) + 1

        # --- Create the session ---
        session = super().create(validated_data)
        session.sess_type.set(session_types)

        # --- Ensure session progress entries (ManyToMany through SessionProgress) ---
        from shared_model.models import SessionProgress

        #  FIXED LOGIC: Handle shared vs. individual sessions properly
        if validated_data.get("sess_num") == 1:
            # Shared session: only link explicitly assigned officials
            for off in officials:
                SessionProgress.objects.get_or_create(session=session, official=off)
        else:
            # Session 2+: always link the logged-in official, even if not listed
            if official:
                SessionProgress.objects.get_or_create(session=session, official=official)
            # And also link any additional explicitly assigned officials (if any)
            for off in officials:
                SessionProgress.objects.get_or_create(session=session, official=off)

        session.save()
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

class SessionSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for session list display.
    - Used session list endpoint.
    """
    victim_name = serializers.SerializerMethodField()
    case_no = serializers.SerializerMethodField()
    official_names = serializers.SerializerMethodField()
    official_roles = serializers.SerializerMethodField()  
    location = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "sess_date_today",  
            "sess_type",
            "victim_name",
            "case_no",
            "official_names",
            "official_roles",  
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
        progress_entries = getattr(obj, "_prefetched_progress", None)
        if progress_entries is None:
            progress_entries = obj.progress.select_related("official").all()
        return [p.official.full_name for p in progress_entries if p.official]

    def get_official_roles(self, obj):
        progress_entries = getattr(obj, "_prefetched_progress", None)
        if progress_entries is None:
            progress_entries = obj.progress.select_related("official").all()
        return [p.official.of_role for p in progress_entries if p.official]

    def get_location(self, obj):
        return obj.sess_location or None

class IncidentInformationSerializer(serializers.ModelSerializer):
    """
    Displays incident info along with all linked sessions for debugging.
    Temporarily logs how many sessions are being serialized per incident.
    """
    sessions = serializers.SerializerMethodField()
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)
    evidences = serializers.SerializerMethodField()

    class Meta:
        model = IncidentInformation
        fields = "__all__"

    def get_sessions(self, obj):
        from shared_model.models import Session
        import sys

        # Force a fresh query directly by numeric FK ID (not encrypted FK object)
        queryset = (
            Session.objects.filter(incident_id_id=obj.incident_id)
            .select_related("incident_id")
            .prefetch_related("progress__official", "sess_type")
            .order_by("sess_num", "sess_id")
        )

        count = queryset.count()
        print(f"[DEBUG] Incident {obj.incident_id}: Found {count} sessions", file=sys.stderr)

        # Prefetch for official names
        for s in queryset:
            s._prefetched_progress = list(s.progress.select_related("official").all())

        return SessionSerializer(queryset, many=True, context={"request": self.context.get("request")}).data
    
    def get_evidences(self, obj):
        qs = Evidence.objects.filter(incident=obj)
        # ✅ forward the request context so get_file_url works
        return EvidenceSerializer(
            qs,
            many=True,
            context={"request": self.context.get("request")}
        ).data

class VictimListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    incidents = IncidentInformationSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    full_address = serializers.SerializerMethodField()  # <-- NEW FIELD

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
    
    def get_full_address(self, obj):
        address = obj.address
        if not address:
            return None

        parts = [
            address.street,
            address.sitio,
            address.barangay.name if address.barangay else None,
            address.municipality.name if address.municipality else None,
            address.province.name if address.province else None,
        ]

        return ", ".join([p for p in parts if p])

class EvidenceSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        url = reverse("evidence_view", args=[obj.pk])
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url  # fallback relative URL

    class Meta:
        model = Evidence
        fields = ["id", "description", "uploaded_at", "file_url"]




class SessionTypeQuestionSerializer(serializers.ModelSerializer): 
    """
    Serializer for mapped (template) questions per session type and number.
    - Used when previewing or hydrating session questions.
    """
    question_text = serializers.CharField(source="question.ques_question_text", read_only=True)
    question_category_name = serializers.SerializerMethodField()
    question_role = serializers.SerializerMethodField()
    question_answer_type = serializers.CharField(source="question.ques_answer_type", read_only=True)

    class Meta:
        model = SessionTypeQuestion
        fields = [
            "id",
            "session_number",
            "session_type",
            "question",
            "question_text",
            "question_category_name",
            "question_role",
            "question_answer_type",
        ]

    def get_question_category_name(self, obj):
        try:
            return obj.question.ques_category.name if obj.question and obj.question.ques_category else "(Uncategorized)"
        except Exception:
            return "(Uncategorized)"

    def get_question_role(self, obj):
        try:
            return obj.question.role if obj.question and obj.question.role else "Unassigned"
        except Exception:
            return "Unassigned"

class SessionQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField()
    question_category_name = serializers.SerializerMethodField()
    question_answer_type = serializers.SerializerMethodField()

    #fields to expose who answered this question (if any)
    answered_by = serializers.IntegerField(source="answered_by.pk", read_only=True)
    answered_by_name = serializers.CharField(source="answered_by.full_name", read_only=True)
    answered_at = serializers.DateTimeField(read_only=True)

    # helpful computed flags
    is_answered = serializers.SerializerMethodField()
    assigned_role = serializers.SerializerMethodField()  # returns role string (e.g., "Social Worker")

    class Meta:
        model = SessionQuestion
        fields = [
            "sq_id",
            "question",
            "question_text",
            "question_category_name",
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
    def get_question_text(self, obj):
    # Prefer snapshot version, then fall back to linked question
        return (
            obj.sq_question_text_snapshot
            or (obj.question.ques_question_text if obj.question else obj.sq_custom_text)
            or None
        )
    def get_question_answer_type(self, obj):
    # Prefer snapshot version, then fall back to linked question
        return (
            obj.sq_answer_type_snapshot
            or (obj.question.ques_answer_type if obj.question else obj.sq_custom_answer_type)
            or None
        )
    def get_is_answered(self, obj):
        return obj.sq_value is not None and obj.sq_value != ""

    def get_question_category_name(self, obj):
        try:
            return obj.question.ques_category.name if obj.question and obj.question.ques_category else None
        except Exception:
            return None

    def get_assigned_role(self, obj):
        """
        Return the role string that this question belongs to.
        Prefer question.role if set, else fallback to question.ques_category.role.
        """
        try:
            if not obj.question:
                return None
            # question.role is set when creating question; fallback to category.role
            return obj.question.role or getattr(obj.question.ques_category, "role", None)
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

class SessionDetailSerializer(serializers.ModelSerializer): 
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
    questions = SessionQuestionSerializer(
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
                ques_is_required=q.get("ques_is_required", True),
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



#============================= Social Worker Dashboard ======================================
# --- Victim Summary ---
class VictimSummarySerializer(serializers.Serializer):
    total_victims = serializers.IntegerField()
    total_victims_percent = serializers.FloatField(required=False)  # optional if you want KPI %

# --- Session Summary ---
class SessionSummarySerializer(serializers.Serializer):
    total_assigned_sessions = serializers.IntegerField()
    total_assigned_percent = serializers.FloatField()

    sessions_this_week = serializers.IntegerField()
    sessions_week_percent = serializers.FloatField()

    pending_sessions = serializers.IntegerField()
    pending_percent = serializers.FloatField()

    ongoing_sessions = serializers.IntegerField()
    ongoing_percent = serializers.FloatField()

    done_sessions = serializers.IntegerField()
    done_percent = serializers.FloatField(required=False)      


# --- Monthly Report Row ---
class MonthlyReportRowSerializer(serializers.Serializer):
    month = serializers.CharField()
    totalVictims = serializers.IntegerField()
    Physical_Violence = serializers.IntegerField()
    Physical_Abused = serializers.IntegerField()
    Psychological_Violence = serializers.IntegerField()
    Psychological_Abuse = serializers.IntegerField()
    Economic_Abused = serializers.IntegerField()
    Strandee = serializers.IntegerField()
    Sexually_Abused = serializers.IntegerField()
    Sexually_Exploited = serializers.IntegerField()


# --- Upcoming Sessions ---
class UpcomingSessionSerializer(serializers.ModelSerializer):
    victim_name = serializers.SerializerMethodField()
    session_type = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "victim_name",
            "session_type",
        ]

    def get_victim_name(self, obj):
        if obj.incident_id and obj.incident_id.vic_id:
            return obj.incident_id.vic_id.full_name
        return None

    def get_session_type(self, obj):
        return obj.sess_type.first().name if obj.sess_type.exists() else None


# --- Overdue Sessions (same structure as Upcoming) ---
class OverdueSessionSerializer(serializers.ModelSerializer):
    victim_name = serializers.SerializerMethodField()
    session_type = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_num",
            "sess_status",
            "sess_next_sched",
            "victim_name",
            "session_type",
        ]

    def get_victim_name(self, obj):
        if obj.incident_id and obj.incident_id.vic_id:
            return obj.incident_id.vic_id.full_name
        return None

    def get_session_type(self, obj):
        return obj.sess_type.first().name if obj.sess_type.exists() else None


# --- Violence Type Summary ---
class ViolenceTypeSerializer(serializers.Serializer):
    type = serializers.CharField()
    count = serializers.IntegerField()

# ========================= REPORTS =========================

# --- Social Worker Monthly Report (full CRUD) ---
# --- Social Worker Monthly Report (full CRUD) ---
class SocialWorkerMonthlyReportSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyProgressReport
        fields = "__all__"
        # ✅ Auto-set fields are read-only
        read_only_fields = [
            "victim",
            "incident",
            "report_month",
            "report_type",
            "prepared_by",
            "name",
            "sex",
            "age",
            "date_of_birth",
            "height",
            "weight",
            "bmi",
            "bmi_category",
            "created_at",
        ]

    def get_prepared_by_name(self, obj):
        return getattr(obj.prepared_by, "full_name", "—")


# --- Nurse Monthly Report (read-only) ---
class NurseMonthlyReportSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyProgressReport
        fields = "__all__"

    def get_prepared_by_name(self, obj):
        return getattr(obj.prepared_by, "full_name", "—")


# --- Psychometrician Comprehensive Report (read-only) ---
class ComprehensivePsychReportSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ComprehensivePsychReport
        fields = "__all__"

    def get_prepared_by_name(self, obj):
        return getattr(obj.prepared_by, "full_name", "—")


# --- Psychometrician Monthly Progress Report (read-only) ---
class MonthlyPsychProgressReportSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyPsychProgressReport
        fields = "__all__"

    def get_prepared_by_name(self, obj):
        return getattr(obj.prepared_by, "full_name", "—")
