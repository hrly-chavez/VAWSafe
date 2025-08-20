from rest_framework import generics
from shared_model.models import *
from .serializers import *


# List for table
class victim_list(generics.ListAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimListSerializer


# Detail for VictimDetailPage
class victim_detail(generics.RetrieveAPIView):
    queryset = Victim.objects.all()
    serializer_class = VictimDetailSerializer
    lookup_field = "vic_id"
