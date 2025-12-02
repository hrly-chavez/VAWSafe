from rest_framework import serializers, generics, permissions
from shared_model.models import *
from datetime import date
from PIL import Image

#===========================================VAWC Victim==========================================
class VictimListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    violence_type = serializers.SerializerMethodField()

    class Meta:
        model = Victim
        fields = ["vic_id", "vic_first_name", "vic_middle_name", "vic_last_name", 
                  "vic_extension", "vic_sex", "vic_birth_place",  "vic_contact_number", "age", "violence_type",]

    def get_age(self, obj):
        if obj.vic_birth_date:
            today = date.today()
            return (
                today.year
                - obj.vic_birth_date.year
                - ((today.month, today.day) < (obj.vic_birth_date.month, obj.vic_birth_date.day))
            )
        return None
    
    def get_violence_type(self, obj):
        latest_incident = obj.incidents.order_by("-created_at").first()
        return latest_incident.violence_type if latest_incident else None
    
class VictimFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimFaceSample
        fields = ["photo", "embedding"]  # embedding can be excluded if not needed

class SessionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionType
        fields = ["id", "name"]

class SessionQuestionSerializer(serializers.ModelSerializer):  # Generated + answered questions
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
            "sq_is_required",
            "sq_value",   
            "sq_note",    
        ]

# class DeskOfficerSessionDetailSerializer(serializers.ModelSerializer): #show session and session answer in card
#     official_name = serializers.CharField(source="assigned_official.full_name", read_only=True)
#     sess_type = SessionTypeSerializer(many=True, read_only=True)
#     session_questions = SessionQuestionSerializer(many=True, read_only=True)

#     class Meta:
#         model = Session
#         fields = [
#             "sess_id",
#             "sess_num",
#             "sess_status",
#             "sess_next_sched",
#             "sess_date_today",
#             "sess_location",
#             "sess_description",
#             "official_name",
#             "sess_type",          # names not IDs
#             "session_questions",  # answered questions
#         ]


# ====== SERVICES GIVEN (part of Session Detail) ======
class DSWDServiceGivenSerializer(serializers.ModelSerializer):
    """
    Read-only serializer showing all details of services given in a session.
    Uniform with Social Worker and Desk Officer versions.
    """
    service = serializers.SerializerMethodField()
    handled_by = serializers.CharField(source="of_id.full_name", read_only=True)

    class Meta:
        model = ServiceGiven
        fields = [
            "id",
            "service",           # nested info
            "handled_by",        # social worker name
            "service_status",
            "service_feedback",
            "service_pic",
        ]

    def get_service(self, obj):
        """Return nested service info (organization, category, contacts)."""
        if not obj.serv_id:
            return None
        service = obj.serv_id
        return {
            "serv_id": service.serv_id,
            "name": service.name,
            "category": service.category.name if service.category else None,
            "contact_person": service.contact_person,
            "contact_number": service.contact_number,
        }

# ====== DSWD SESSION DETAIL ======
class DSWDSessionDetailSerializer(serializers.ModelSerializer):
    """
    DSWD view-only session detail with services, questions, and metadata.
    """
    official_name = serializers.CharField(source="assigned_official.full_name", read_only=True)
    sess_type_display = SessionTypeSerializer(source="sess_type", many=True, read_only=True)
    questions = SessionQuestionSerializer(source="session_questions", many=True, read_only=True)
    services_given = DSWDServiceGivenSerializer(many=True, read_only=True)

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
            "official_name",
            "sess_type_display",
            "questions",
            "services_given",
        ]

#==================================================================
class PerpetratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perpetrator
        fields = "__all__"

class SessionSerializer(serializers.ModelSerializer):
    victim_name = serializers.SerializerMethodField()
    case_no = serializers.SerializerMethodField() 
    location = serializers.SerializerMethodField()
    official_name = serializers.SerializerMethodField()
    sess_type = serializers.PrimaryKeyRelatedField(
        many=True, queryset=SessionType.objects.all()
    )

    class Meta:
        model = Session
        fields = "__all__"
        read_only_fields = ["sess_id", "sess_num","sess_updated_at"]

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
        return [official.full_name for official in obj.assigned_official.all()]

class IncidentInformationSerializer(serializers.ModelSerializer): #fetch case and session in victim info
    sessions = SessionSerializer(many=True, read_only=True)  #  add sessions
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)  
    class Meta:
        model = IncidentInformation
        fields = "__all__"
        read_only_fields = ["incident_id", "incident_num"]

class IncidentWithPerpetratorSerializer(serializers.ModelSerializer):
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)

    class Meta:
        model = IncidentInformation
        fields = "__all__"

class VictimDetailSerializer(serializers.ModelSerializer):
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    incidents = IncidentWithPerpetratorSerializer(many=True, read_only=True)

    class Meta:
        model = Victim
        fields = "__all__"

class SocialWorkerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    photo = serializers.ImageField(source="of_photo", read_only=True)

    class Meta:
        model = Official
        fields = [
            "of_id",
            "full_name",
            "of_role",
            "of_contact",
            "photo",
            "of_specialization",
        ]

    def get_full_name(self, obj):
        parts = [obj.of_fname]
        if obj.of_m_initial:
            parts.append(f"{obj.of_m_initial}.")
        parts.append(obj.of_lname)
        if obj.of_suffix:
            parts.append(obj.of_suffix)
        return " ".join(parts)
    
class OfficialFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficialFaceSample
        fields = ["photo"]  # keep it light; omit embeddings in API responses

class VictimMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Victim
        fields = ["vic_id", "vic_first_name", "vic_last_name", "vic_sex"]

class IncidentMiniSerializer(serializers.ModelSerializer):
    victim = VictimMiniSerializer(source="vic_id", read_only=True)
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)

    class Meta:
        model = IncidentInformation
        fields = [
            "incident_id",
            "incident_date",
            "incident_location",
            "incident_description",
            "type_of_place",
            "victim",
            "perpetrator",
        ]

class SessionMiniSerializer(serializers.ModelSerializer):
    incident = IncidentMiniSerializer(source="incident_id", read_only=True)

    class Meta:
        model = Session
        fields = [
            "sess_id",
            "sess_date_today",
            "sess_status",
            "sess_next_sched",
            "incident",
        ]

class SocialWorkerDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    face_samples = OfficialFaceSampleSerializer(many=True, read_only=True)
    handled_incidents = IncidentMiniSerializer(many=True, read_only=True)
    sessions_handled = SessionMiniSerializer(many=True, read_only=True)

    class Meta:
        model = Official
        fields = "__all__"

    def get_full_name(self, obj):
        parts = [obj.of_fname]
        if obj.of_m_initial:
            parts.append(f"{obj.of_m_initial}.")
        parts.append(obj.of_lname)
        if obj.of_suffix:
            parts.append(obj.of_suffix)
        return " ".join(parts)
    
class VAWDeskOfficerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    photo = serializers.ImageField(source="of_photo", read_only=True)

    class Meta:
        model = Official
        fields = "__all__"

    def get_full_name(self, obj):
        parts = [obj.of_fname]
        if obj.of_m_initial:
            parts.append(f"{obj.of_m_initial}.")
        parts.append(obj.of_lname)
        if obj.of_suffix:
            parts.append(obj.of_suffix)
        return " ".join(parts)

#====================================Questions========================================
class QuestionSerializer(serializers.ModelSerializer):
    """ Serializer for Question model.
    - Returns all question fields.
    - Adds 'created_by_name' for display in frontend.
    - Adds 'mappings' showing which session types/numbers use this question.
    """
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    mappings = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = "__all__"
        read_only_fields = ["ques_id", "created_at", "created_by_name", "mappings"]

    def get_mappings(self, obj):
        return [
            {
                "session_number": m.session_number,
                "session_type": m.session_type.name,
                "session_type_id": m.session_type.id,
            }
            for m in obj.type_questions.all()
        ]
    def update(self, instance, validated_data):
        validated_data.pop("mappings", None)  # safely ignore read-only field
        return super().update(instance, validated_data)

class SessionTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for SessionType model.
    - Used to populate dropdowns for session type selection.
    """
    class Meta:
        model = SessionType
        fields = ["id", "name"]

class SessionTypeQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for SessionTypeQuestion model.
    - Shows which question is assigned to which session type and number.
    - Includes human-readable names for session type and question text.
    """
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
        read_only_fields = ["id", "question_text", "session_type_name"]

class BulkQuestionSerializer(serializers.Serializer):
    """
    Handles bulk creation of multiple questions in one request.
    - Creates multiple Question objects using the current logged-in official.
    """
    questions = QuestionSerializer(many=True)

    def create(self, validated_data):
        official = self.context["request"].user.official
        created = []
        for q in validated_data["questions"]:
            obj = Question.objects.create(created_by=official, **q)
            created.append(obj)
        return created
    
# Attach Bulk serializer to QuestionSerializer
class QuestionBulkItemSerializer(QuestionSerializer):
    """
    Links QuestionSerializer with BulkQuestionSerializer for list operations.
    - Enables POSTing multiple questions at once.
    """

    class Meta(QuestionSerializer.Meta):
        list_serializer_class = BulkQuestionSerializer

class BulkAssignSerializer(serializers.Serializer):
    """
    Used for bulk assigning questions to multiple session types and numbers.
    - Accepts lists of question IDs, session numbers, and session type IDs.
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

class ChangeLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ChangeLog
        fields = "__all__"

#====================================================================================

# class AddressSerializer(serializers.ModelSerializer):
#     province_name = serializers.CharField(source="province.name", read_only=True)
#     municipality_name = serializers.CharField(source="municipality.name", read_only=True)
#     barangay_name = serializers.CharField(source="barangay.name", read_only=True)

#     class Meta:
#         model = Address
#         fields = ["id", "province", "province_name", "municipality", "municipality_name", "barangay", "barangay_name", "sitio", "street"]

#     def to_representation(self, instance):
#         parts = []
#         if instance.street:
#             parts.append(str(instance.street))
#         if instance.sitio:
#             parts.append(str(instance.sitio))
#         if instance.barangay:
#             parts.append(str(instance.barangay))
#         if instance.municipality:
#             parts.append(str(instance.municipality))
#         if instance.province:
#             parts.append(str(instance.province))
#         return ", ".join(parts) or "—"

#===========================================Address==========================================
class AddressSerializer(serializers.ModelSerializer):
    province_name = serializers.SerializerMethodField()
    municipality_name = serializers.SerializerMethodField()
    barangay_name = serializers.SerializerMethodField()

    # province_name = serializers.CharField(source='province.name', read_only=True)
    # municipality_name = serializers.CharField(source='municipality.name', read_only=True)
    # barangay_name = serializers.CharField(source='barangay.name', read_only=True)

    class Meta:
        model = Address
        fields = [
            "id",
            "province",
            "province_name",
            "municipality",
            "municipality_name",
            "barangay",
            "barangay_name",
            "sitio",
            "street",
        ]

    def get_province_name(self, obj):
        if not obj.province:
            return None
        return getattr(obj.province, "name", getattr(obj.province, "prov_name", str(obj.province)))

    def get_municipality_name(self, obj):
        if not obj.municipality:
            return None
        return getattr(obj.municipality, "name", getattr(obj.municipality, "mun_name", str(obj.municipality)))

    def get_barangay_name(self, obj):
        if not obj.barangay:
            return None
        return getattr(obj.barangay, "name", getattr(obj.barangay, "brgy_name", str(obj.barangay)))


#===========================================Official==========================================
class OfficialSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    address = AddressSerializer(read_only=True)
    user_is_active = serializers.SerializerMethodField()
    deleted_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Official
        fields = [
            "of_id", "full_name", "of_role", "of_contact", "of_email", "of_photo", "of_dob", "of_pob", "of_fname", "of_lname", "of_m_initial", "of_sex",
            "address", "user_is_active", "deleted_at"
        ]

    def get_user_is_active(self, obj):
        if obj.user_id:
            return bool(obj.user.is_active)
        return None

    def validate_of_photo(self, file):
        allowed_types = ["JPEG", "PNG"]

        # Validate image content using PIL (safer than imghdr)
        try:
            img = Image.open(file)
            img.verify()  # verifies integrity
        except Exception:
            raise serializers.ValidationError("Uploaded file is not a valid image.")

        # Check image format
        if img.format not in allowed_types:
            raise serializers.ValidationError("Only JPG and PNG images are allowed.")

        # Reset file pointer (verify() moves it)
        file.seek(0)

        # Validate file size
        if file.size > 3 * 1024 * 1024:
            raise serializers.ValidationError("Image is too large (max 3MB).")

        return file

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    class Meta:
        model = AuditLog
        fields = ["id", "action", "target_model", "target_id", "reason", "changes", "created_at", "actor_name"]

    def get_actor_name(self, obj):
        if obj.actor and hasattr(obj.actor, "official"):
            return obj.actor.official.full_name
        return getattr(obj.actor, "username", None)

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = "__all__"

class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = "__all__"

class BarangaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Barangay
        fields = "__all__"

#===========================================Services==========================================
class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name"]

class ServicesSerializer(serializers.ModelSerializer):
    # assigned_place = AddressSerializer(required=False, allow_null=True)
    category_name = serializers.SerializerMethodField()
    service_address = AddressSerializer(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)  

    class Meta:
        model = Services
        fields = [
            "serv_id",
            "name",
            "contact_person",
            "contact_number",
            "category",        # still included for POST/PUT
            "category_name",   #  new readable field para sa display name
            "service_address",
            "is_active", 
        ]
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def create(self, validated_data):
        # Extract nested address data
        # assigned_place_data = validated_data.pop("assigned_place", None)
        print("VALIDATED:", validated_data)
        service_address_data = validated_data.pop("service_address", None)

        # assigned_place = Address.objects.create(**assigned_place_data) if assigned_place_data else None
        service_address = Address.objects.create(**service_address_data) if service_address_data else None

        # ✅ Automatically set `is_active`
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # Default to inactive
        is_active_value = False

        if user and user.is_authenticated:
            # If user has a DSWD role, auto-activate
            if hasattr(user, "official") and user.official.of_role == "DSWD":
                is_active_value = True

        # Create the service record
        return Services.objects.create(
            # assigned_place=assigned_place,
            service_address=service_address,
            is_active=is_active_value,  # ✅ Set automatically
            **validated_data
        )

    def update(self, instance, validated_data):
        service_address_data = validated_data.pop("service_address", None)

        if service_address_data:
            if instance.service_address:
                for attr, value in service_address_data.items():
                    setattr(instance.service_address, attr, value)
                instance.service_address.save()
            else:
                instance.service_address = Address.objects.create(**service_address_data)

        # ✅ Allow DSWD to update is_active
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not (user and hasattr(user, "official") and user.official.of_role == "DSWD"):
            validated_data.pop("is_active", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

#===========================================Serializers for Dashboard views==========================================
class FemaleVictimSummarySerializer(serializers.Serializer):
    total_female_victims = serializers.IntegerField()
    age_0_18 = serializers.IntegerField()
    age_18_35 = serializers.IntegerField()
    age_36_50 = serializers.IntegerField()
    age_51_plus = serializers.IntegerField()
    age_0_18_percent = serializers.FloatField()
    age_18_35_percent = serializers.FloatField()
    age_36_50_percent = serializers.FloatField()
    age_51_plus_percent = serializers.FloatField()

class IncidentSummarySerializer(serializers.Serializer):
    total_cases = serializers.IntegerField()
    active_cases = serializers.IntegerField()
    active_percent = serializers.FloatField()       
    resolved_cases = serializers.IntegerField()
    resolved_percent = serializers.FloatField()     
    violence_types = serializers.DictField(child=serializers.IntegerField())
    status_types = serializers.DictField(child=serializers.IntegerField())
    top_violence_type = serializers.CharField()
    top_violence_percent = serializers.FloatField()

class MonthlyReportRowSerializer(serializers.Serializer):
    month = serializers.CharField()
    totalVictims = serializers.IntegerField()
    Physical_Violence = serializers.IntegerField(source="Physical Violence")
    Physical_Abused = serializers.IntegerField(source="Physical Abused")
    Psychological_Violence = serializers.IntegerField(source="Psychological Violence")
    Psychological_Abuse = serializers.IntegerField(source="Psychological Abuse")
    Economic_Abused = serializers.IntegerField(source="Economic Abused")
    Strandee = serializers.IntegerField()
    Sexually_Abused = serializers.IntegerField(source="Sexually Abused")
    Sexually_Exploited = serializers.IntegerField(source="Sexually Exploited")
    referredDSWD = serializers.IntegerField()
    referredHospital = serializers.IntegerField()

#===========================================Serializers for Login Tracker ==========================================
class LoginTrackerSerializer(serializers.ModelSerializer):
    official_name = serializers.CharField(source="get_official_name", read_only=True)

    class Meta:
        model = LoginTracker
        fields = [
            "id",
            "user",
            "username_attempted",
            "role",
            "ip_address",
            "user_agent",
            "login_time",
            "status",
            "official_name",
        ]