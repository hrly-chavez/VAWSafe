from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import VictimSignupSerializer, VictimProfileSerializer
from shared_model.models import *


class VictimSignupView(APIView):
    def post(self, request):
        serializer = VictimSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Victim registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VictimLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(username=email, password=password)

        if user and hasattr(user, "victim"):
            victim = user.victim
            serialized = VictimProfileSerializer(victim)
            return Response(serialized.data, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials or victim profile not found"}, status=status.HTTP_401_UNAUTHORIZED)
