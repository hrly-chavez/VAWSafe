from django.shortcuts import render
from shared_model.models import *
from rest_framework import generics
from .serializers import *

# Create your views here.

class ViewVictim (generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimListSerializer
    
class ViewDetail (generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"