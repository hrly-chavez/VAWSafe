from rest_framework import serializers
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


class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = "__all__"


class IncidentInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentInformation
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
    
class OfficialSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Official
        fields = [
            "of_id", "full_name", "of_role", "of_contact", "of_photo",
            "province", "municipality", "barangay", "sitio", "street", "of_assigned_barangay", "status"
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



class ServicesSerializer(serializers.ModelSerializer):
    assigned_place = AddressSerializer()
    service_address = AddressSerializer()

    class Meta:
        model = Services
        fields = ["id", "category", "name", "contact_person", "contact_number", "assigned_place", "service_address"]

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
