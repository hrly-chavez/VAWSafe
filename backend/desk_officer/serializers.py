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
        fields = ["photo", "embedding"]
        read_only_fields = ["embedding"]

class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = [
            "handling_org", "office_address", "report_type",
            "informant_name", "informant_relationship", "informant_contact",
            
        ]
        

class VictimSerializer(serializers.ModelSerializer):
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    case_report = CaseReportSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    class Meta:
        model = Victim
        fields = "__all__"

class IncidentInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentInformation
        fields = "__all__"
        read_only_fields = ["incident_id", "incident_num"]  # prevent frontend from setting it

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
        
class SessionSerializer(serializers.ModelSerializer):
    victim_name = serializers.SerializerMethodField()
    case_no = serializers.SerializerMethodField() 
    location = serializers.SerializerMethodField()
    official_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = "__all__"
        read_only_fields = ["sess_id", "sess_num","sess_updated_at"]
    def get_victim_name(self, obj):
        # Check if session has an incident and victim
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
        # Auto-generate sess_num based on incident
        incident = validated_data.get("incident_id")
        if incident:
            last_num = (
                Session.objects.filter(incident_id=incident)
                .order_by("-sess_num")
                .values_list("sess_num", flat=True)
                .first()
            )
            validated_data["sess_num"] = (last_num or 0) + 1
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["sess_updated_at"] = date.today()
        return super().update(instance, validated_data)
    def get_official_name(self, obj):
        return obj.assigned_official.full_name if obj.assigned_official else None
    
    

# Account Management

class OfficialSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Official
        fields = [
            "of_id", "full_name", "of_role", "of_contact", "of_photo",
            "province", "municipality", "barangay", "sitio", "street", "of_assigned_barangay"
        ]

