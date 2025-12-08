from rest_framework import serializers
from shared_model.models import *
from django.contrib.auth.models import User
import re

HTML_TAG_PATTERN = re.compile(r"[<>]")

def sanitize_text(value: str) -> str:
    if not isinstance(value, str):
        return value

    # Remove HTML tags
    value = re.sub(r"<.*?>", "", value)

    # Remove script-like content
    value = re.sub(r"(javascript:|script)", "", value, flags=re.IGNORECASE)

    # Trim spaces
    return value.strip()

def sanitize_text_fields(attrs, fields):
    for field in fields:
        if field in attrs and isinstance(attrs[field], str):
            attrs[field] = sanitize_text(attrs[field])


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]
    
    def validate_username(self, value):
        return sanitize_text(value)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "province", "municipality", "barangay", "sitio", "street"]

    def validate(self, attrs):
        text_fields = ["province", "municipality", "barangay", "sitio", "street"]
        sanitize_text_fields(attrs, text_fields)
        return attrs

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
    address = AddressSerializer()

    class Meta:
        model = Official
        fields = "__all__"

    # Validate and sanitize before saving
    def validate(self, attrs):

        text_fields = [
            "of_fname",
            "of_lname",
            "of_email",
            "of_role",
            "of_m_initial",
            "of_suffix",
            "of_sex",
            "of_dob",
            "of_pob",
            "of_contact",
        ]

        sanitize_text_fields(attrs, text_fields)
        return attrs

    def create(self, validated_data):
        address_data = validated_data.pop("address")
        address = Address.objects.create(**address_data)
        official = Official.objects.create(address=address, **validated_data)
        return official


class OfficialFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficialFaceSample
        fields = "_all_"