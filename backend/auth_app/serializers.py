from rest_framework import serializers
from shared_model.models import *
from django.contrib.auth.models import User

# class AccountSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Account
#         fields = ['username', 'password']
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

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


# class OfficialSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Official
#         fields = "__all__"

class OfficialSerializer(serializers.ModelSerializer):
    address = AddressSerializer()

    class Meta:
        model = Official
        fields = "__all__"

    def create(self, validated_data):
        address_data = validated_data.pop("address")
        address = Address.objects.create(**address_data)
        official = Official.objects.create(address=address, **validated_data)
        return official


class OfficialFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficialFaceSample
        fields = "_all_"