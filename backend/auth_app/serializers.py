from rest_framework import serializers
from shared_model.models import *


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