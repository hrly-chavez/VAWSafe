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

class OfficialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Official
        fields = "__all__"

class OfficialFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficialFaceSample
        fields = "_all_"