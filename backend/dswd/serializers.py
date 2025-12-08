from django.urls import reverse
from rest_framework import serializers
from shared_model.models import *
from PIL import Image

#===========================================Address==========================================
class AddressSerializer(serializers.ModelSerializer):
    province_name = serializers.SerializerMethodField()
    municipality_name = serializers.SerializerMethodField()
    barangay_name = serializers.SerializerMethodField()

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
    year = serializers.IntegerField()
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