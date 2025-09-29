from rest_framework import serializers
from shared_model.models import *
from datetime import date

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

# --- Lightweight list serializer ---
class VictimListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
   
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

class VictimFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimFaceSample
        fields = ["photo", "embedding"]
        read_only_fields = ["embedding"]

class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = [
            "handling_org", "office_address", "report_type",
            "informant_name", "informant_relationship", "informant_contact",
            
        ]

class InformantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Informant
        fields = "__all__"

class VictimSerializer(serializers.ModelSerializer):
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    case_report = CaseReportSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    full_address = serializers.SerializerMethodField()

    class Meta:
        model = Victim
        fields = "__all__"
    
    def get_full_address(self, obj):
        return obj.compose_full_address()

    def create(self, validated_data):
        # Extract foreign key IDs from initial data
        province_id = self.initial_data.get("province")
        municipality_id = self.initial_data.get("municipality")
        barangay_id = self.initial_data.get("barangay")
        sitio_id = self.initial_data.get("sitio")
        street_id = self.initial_data.get("street")

        # Assign foreign keys manually
        if province_id:
            validated_data["province_id"] = province_id
        if municipality_id:
            validated_data["municipality_id"] = municipality_id
        if barangay_id:
            validated_data["barangay_id"] = barangay_id
        if sitio_id:
            validated_data["sitio_id"] = sitio_id
        if street_id:
            validated_data["street_id"] = street_id

        return Victim.objects.create(**validated_data)

class PerpetratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perpetrator
        fields = "__all__"

# class IncidentWithPerpetratorSerializer(serializers.ModelSerializer):
#     perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)

#     class Meta:
#         model = IncidentInformation
#         fields = "__all__"  # keep all existing fields
#         extra_fields = ["perpetrator"]

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep["perpetrator"] = PerpetratorSerializer(instance.perp_id).data if instance.perp_id else None
#         return rep

#======================================SESSION=================================================

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

    def update(self, instance, validated_data):
        session_types = validated_data.pop("sess_type", None)
        validated_data["sess_updated_at"] = date.today()

        session = super().update(instance, validated_data)
        if session_types is not None:
            session.sess_type.set(session_types)
        return session

    def get_official_name(self, obj):
        return obj.assigned_official.full_name if obj.assigned_official else None

class IncidentInformationSerializer(serializers.ModelSerializer): #fetch case and session in victim info
    sessions = SessionSerializer(many=True, read_only=True)  #  add sessions
    perpetrator = PerpetratorSerializer(source="perp_id", read_only=True)  
    class Meta:
        model = IncidentInformation
        fields = "__all__"
        read_only_fields = ["incident_id", "incident_num"]

    def create(self, validated_data):
        victim = validated_data.get("vic_id")

        # get last case number for this victim
        last_num = (
            IncidentInformation.objects.filter(vic_id=victim)
            .order_by("-incident_num")
            .values_list("incident_num", flat=True)
            .first()
        )
        validated_data["incident_num"] = (last_num or 0) + 1

        return super().create(validated_data)

class VictimDetailSerializer(serializers.ModelSerializer): #together with IncidentInformationSerializer
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    case_report = CaseReportSerializer(read_only=True)
    incidents = IncidentInformationSerializer(many=True, read_only=True)
    full_address = serializers.SerializerMethodField()

    def get_full_address(self, obj):
        return obj.compose_full_address()

    class Meta:
        model = Victim
        fields = "__all__"
 
class SessionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionType
        fields = ["id", "name"]

class SessionTypeQuestionSerializer(serializers.ModelSerializer): #Mapped questions
    question_text = serializers.CharField(source="question.ques_question_text", read_only=True)
    question_category = serializers.CharField(source="question.ques_category", read_only=True)
    question_answer_type = serializers.CharField(source="question.ques_answer_type", read_only=True)

    class Meta:
        model = SessionTypeQuestion
        fields = ["id", "session_number", "session_type", "question", "question_text", "question_category", "question_answer_type"]

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
            "sq_custom_text",         # for ad-hoc questions
            "sq_custom_answer_type",  # type of ad-hoc questions
            "sq_is_required",
            "sq_value",
            "sq_note",
        ]

class DeskOfficerSessionDetailSerializer(serializers.ModelSerializer): #show session and session answer in card
    official_name = serializers.CharField(source="assigned_official.full_name", read_only=True)
    sess_type = SessionTypeSerializer(many=True, read_only=True)
    session_questions = SessionQuestionSerializer(many=True, read_only=True)

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
            "sess_type",          # names not IDs
            "session_questions",  # answered questions
        ]

class GenerateSessionQuestionsSerializer(serializers.Serializer):
    session_types = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

#======================================SESSION================================================= 

# Account Management
class OfficialSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Official
        fields = [
            "of_id", "full_name", "of_role", "of_contact", "of_photo",
            "province", "municipality", "barangay", "sitio", "street", "of_assigned_barangay"
        ]

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = "__all__"

# class OfficialSerializer(serializers.ModelSerializer):
#     full_name = serializers.ReadOnlyField()

#     class Meta:
#         model = Official
#         fields = [
#             "of_id", "full_name", "of_role", "of_contact", "of_photo",
#             "city", "municipality", "barangay", "sitio", "street",
#             "of_assigned_barangay", "status"  # 👈 Add this
#         ]