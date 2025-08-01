from rest_framework import serializers
from .models import VictimSurvivor

class VictimSurvivorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimSurvivor
        fields = '__all__'
