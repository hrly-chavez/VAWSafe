from rest_framework import serializers
from shared_model.models import *




class VictimFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimFaceSample
        fields = ['photo', 'embedding']  # embedding is read-only
        read_only_fields = ['embedding']

class VictimSerializer(serializers.ModelSerializer):
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)

    class Meta:
        model = Victim
        fields = '__all__'

# from .models import VictimSurvivor

# class VictimSurvivorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VictimSurvivor
#         fields = '__all__'