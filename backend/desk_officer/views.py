from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import VictimSurvivor
from .serializers import VictimSurvivorSerializer

@api_view(['GET'])
def get_victim_survivors(request):
    victim_survivors = VictimSurvivor.objects.all()
    serialized_data = VictimSurvivorSerializer(victim_survivors, many=True).data

    return Response(serialized_data)

@api_view(['POST'])
def register_victim_survivor(request):
    data = request.data
    serializer = VictimSurvivorSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)