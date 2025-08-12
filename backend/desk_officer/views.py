import tempfile
import os
import traceback
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from deepface import DeepFace
from PIL import Image

from shared_model.models import *
from .serializers import *
@api_view(['GET'])
def get_victims(request):
    victims = Victim.objects.all()
    serialized_data = VictimSerializer(victims, many=True).data
    return Response(serialized_data)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def register_victim(request):
    """
    Registers victim details + up to 3 facial images in one request.
    """
    # Step 1: Create Victim record
    serializer = VictimSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    victim = serializer.save()

    # Step 2: Handle photo uploads
    photo_files = request.FILES.getlist("victim_photos")  # field name in frontend form
    if not photo_files:
        return Response({"error": "At least one victim photo is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Save first photo as profile picture
    victim.vic_photo = photo_files[0]
    victim.save()

    # Step 3: Process each photo for embeddings
    created_count = 0
    for index, file in enumerate(photo_files):
        temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        try:
            image = Image.open(file).convert("RGB")
            image.save(temp_image, format="JPEG")
            temp_image.flush()
            temp_image.close()

            embeddings = DeepFace.represent(
                img_path=temp_image.name,
                model_name="ArcFace",
                enforce_detection=True
            )

            if isinstance(embeddings, list) and len(embeddings) > 0 and isinstance(embeddings[0], dict):
                embedding_vector = embeddings[0]["embedding"]
            elif isinstance(embeddings, dict) and "embedding" in embeddings:
                embedding_vector = embeddings["embedding"]
            else:
                raise ValueError("Unexpected DeepFace format")

            VictimFaceSample.objects.create(
                victim=victim,
                photo=file,
                embedding=embedding_vector
            )
            created_count += 1
            print(f"[INFO] Saved face sample #{index + 1} for victim {victim.vic_first_name}")

        except Exception as e:
            traceback.print_exc()
        finally:
            if os.path.exists(temp_image.name):
                os.remove(temp_image.name)

    if created_count == 0:
        return Response({"error": "Face registration failed. No valid samples processed."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "message": f"✅ Victim registered successfully with {created_count} face sample(s).",
        "victim_id": victim.vic_id
    }, status=status.HTTP_201_CREATED)

# @api_view(['POST'])
# def register_victim_survivor(request):
#     data = request.data
#     serializer = VictimSurvivorSerializer(data=data)

#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)