from rest_framework import serializers
from .models import *

from django.core.files.base import ContentFile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'photo', 'embedding']  
        read_only_fields = ['embedding']

    def create(self, validated_data):
        
        return super().create(validated_data)