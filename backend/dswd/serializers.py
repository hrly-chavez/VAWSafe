from rest_framework import serializers, generics, permissions
from shared_model.models import *
from datetime import date

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

class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = "__all__"

class PerpetratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perpetrator
        fields = "__all__"

# class IncidentInformationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = IncidentInformation
#         fields = "__all__"

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
        return obj.assigned_official.full_name if obj.assigned_official else None

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
    case_report = CaseReportSerializer(read_only=True)
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
            "assigned_barangay",
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

#====================================SESSIONS========================================
class QuestionSerializer(serializers.ModelSerializer):
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
            }
            for m in obj.type_questions.all()
        ]

class SessionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionType
        fields = ["id", "name"]

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
        read_only_fields = ["id", "question_text", "session_type_name"]


# Bulk create Questions
class BulkQuestionSerializer(serializers.Serializer):
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
    class Meta(QuestionSerializer.Meta):
        list_serializer_class = BulkQuestionSerializer


class BulkAssignSerializer(serializers.Serializer):
    questions = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )
    session_numbers = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False
    )
    session_types = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

    
# class OfficialSerializer(serializers.ModelSerializer):
#     full_name = serializers.ReadOnlyField()

#     class Meta:
#         model = Official
#         fields = [
#             "of_id", "full_name", "of_role", "of_contact", "of_photo",
#             "province", "municipality", "barangay", "sitio", "street", "of_assigned_barangay", "status"
#         ]

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


class OfficialSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    address = AddressSerializer(read_only=True)

    class Meta:
        model = Official
        fields = [
            "of_id", "full_name", "of_role", "of_contact", "of_photo",
            "address", "of_assigned_barangay", "status"
        ]

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

# class AddressSerializer(serializers.ModelSerializer):
#     province = serializers.PrimaryKeyRelatedField(queryset=Province.objects.all(), allow_null=True, required=False)
#     municipality = serializers.PrimaryKeyRelatedField(queryset=Municipality.objects.all(), allow_null=True, required=False)
#     barangay = serializers.PrimaryKeyRelatedField(queryset=Barangay.objects.all(), allow_null=True, required=False)

#     class Meta:
#         model = Address
#         fields = ["id", "province", "municipality", "barangay", "sitio", "street"]


# class ServicesSerializer(serializers.ModelSerializer):
#     assigned_place = AddressSerializer()
#     service_address = AddressSerializer()

#     class Meta:
#         model = Services
#         fields = ["serv_id", "name", "contact_person", "contact_number", "assigned_place", "service_address"]

#     def create(self, validated_data):
#         assigned_place_data = validated_data.pop("assigned_place", None)
#         service_address_data = validated_data.pop("service_address", None)

#         assigned_place = Address.objects.create(**assigned_place_data) if assigned_place_data else None
#         service_address = Address.objects.create(**service_address_data) if service_address_data else None

#         return Services.objects.create(
#             assigned_place=assigned_place,
#             service_address=service_address,
#             **validated_data
#         )

class ServicesSerializer(serializers.ModelSerializer):
    assigned_place = AddressSerializer(required=False, allow_null=True)
    service_address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Services
        fields = [
            "serv_id",
            "name",
            "contact_person",
            "contact_number",
            "category",
            "assigned_place",
            "service_address",
        ]

    def create(self, validated_data):
        assigned_place_data = validated_data.pop("assigned_place", None)
        service_address_data = validated_data.pop("service_address", None)

        assigned_place = Address.objects.create(**assigned_place_data) if assigned_place_data else None
        service_address = Address.objects.create(**service_address_data) if service_address_data else None

        return Services.objects.create(
            assigned_place=assigned_place,
            service_address=service_address,
            **validated_data
        )

    def update(self, instance, validated_data):
        assigned_place_data = validated_data.pop("assigned_place", None)
        service_address_data = validated_data.pop("service_address", None)

        if assigned_place_data:
            if instance.assigned_place:
                for attr, value in assigned_place_data.items():
                    setattr(instance.assigned_place, attr, value)
                instance.assigned_place.save()
            else:
                instance.assigned_place = Address.objects.create(**assigned_place_data)

        if service_address_data:
            if instance.service_address:
                for attr, value in service_address_data.items():
                    setattr(instance.service_address, attr, value)
                instance.service_address.save()
            else:
                instance.service_address = Address.objects.create(**service_address_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
