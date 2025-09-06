from rest_framework import serializers
from shared_model.models import *


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['username', 'password']

class OfficialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Official
        fields = "__all__"