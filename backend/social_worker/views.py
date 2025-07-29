import tempfile
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from shared_model.models import *
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from deepface import DeepFace
from PIL import Image
from rest_framework.throttling import ScopedRateThrottle    
import traceback
from scipy.spatial.distance import euclidean 
from django.utils.crypto import get_random_string

class UserCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = OfficialSerializer(data=request.data)
        if serializer.is_valid():
            # Generate username from first and last name
            fname = request.data.get("of_fname", "").lower()
            lname = request.data.get("of_lname", "").lower()
            generated_username = f"{fname}{lname}"

            # Generate a random password (you can change this to something more secure)
            generated_password = get_random_string(length=12)

            # Create the account
            account = Account.objects.create(username=generated_username, password=generated_password)

            # Create the official
            official = Official.objects.create(account=account, **serializer.validated_data)

            try:
                print(f"[INFO] Generating embedding for {official.full_name}")
                embeddings = DeepFace.represent(
                    img_path=official.of_photo.path,
                    model_name="ArcFace",
                    enforce_detection=True
                )

                # Extract embedding vector
                if isinstance(embeddings, list) and isinstance(embeddings[0], dict):
                    embedding_vector = embeddings[0]["embedding"]
                elif isinstance(embeddings, dict) and "embedding" in embeddings:
                    embedding_vector = embeddings["embedding"]
                else:
                    embedding_vector = embeddings

                official.of_embedding = embedding_vector
                official.save()
                print(f"[SUCCESS] Embedding saved for {official.full_name}")

            except Exception as e:
                print(f"[ERROR] Failed to generate embedding: {str(e)}")
                traceback.print_exc()

            return Response({
                "message": "Registration successful.",
                "official_id": official.of_id,
                "username": generated_username,
                "password": generated_password,
                "role": official.of_role
            }, status=status.HTTP_201_CREATED)

        print("[ERROR] Invalid data for Official creation")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FaceLoginView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'face_login'

    def post(self, request):
        uploaded_file = request.FILES.get('photo', None)
        if not uploaded_file:
            return Response({"error": "No photo uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        try:
            image = Image.open(uploaded_file).convert("RGB")
            image.save(temp_image, format="JPEG")
            temp_image.flush()
            temp_image.close()

            print(f"[INFO] Analyzing uploaded image for login")
            embedding_result = DeepFace.represent(
                img_path=temp_image.name,
                model_name="ArcFace",
                enforce_detection=True
            )

            if isinstance(embedding_result, list) and isinstance(embedding_result[0], dict):
                uploaded_embedding = embedding_result[0]["embedding"]
            elif isinstance(embedding_result, dict) and "embedding" in embedding_result:
                uploaded_embedding = embedding_result["embedding"]
            elif isinstance(embedding_result, list) and all(isinstance(x, float) for x in embedding_result):
                uploaded_embedding = embedding_result
            else:
                raise ValueError("Unexpected embedding format from DeepFace.")

            os.remove(temp_image.name)

            # Compare with all registered officials
            closest_official = None
            closest_distance = float("inf")

            for official in Official.objects.exclude(of_embedding=None):
                stored_embedding = [float(x) for x in official.of_embedding]
                distance = euclidean(uploaded_embedding, stored_embedding)
                print(f"[DEBUG] Distance to {official.of_fname} {official.of_lname}: {distance:.4f}")

                if distance < closest_distance:
                    closest_distance = distance
                    closest_official = official

            if closest_official and closest_distance < 10.0:
                print(f"[MATCH] Found: {closest_official.of_fname} {closest_official.of_lname}")
                return Response({
                    "match": True,
                    "official_id": closest_official.of_id,
                    "fname": closest_official.of_fname,
                    "lname": closest_official.of_lname,
                    "username": closest_official.account.username,
                    "role": closest_official.of_role
                }, status=status.HTTP_200_OK)

            print("[INFO] No matching face found")
            return Response({
                "match": False,
                "message": "No matching face found. Try again or use alternative login."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            error_msg = str(e)
            traceback.print_exc()

            suggestion = "Face not detected. Please make sure your face is visible and well-lit."
            if "image too small" in error_msg.lower():
                suggestion = "Move closer to the camera."
            elif "no face detected" in error_msg.lower():
                suggestion = "Ensure your face is centered and clearly visible."
            elif "multiple faces" in error_msg.lower():
                suggestion = "Only one face should be in the frame."

            return Response({
                "match": False,
                "error": error_msg,
                "suggestion": suggestion
            }, status=status.HTTP_400_BAD_REQUEST)

        finally:
            if os.path.exists(temp_image.name):
                os.remove(temp_image.name)



class ManualLoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            account = Account.objects.get(username=username, password=password)
            official = Official.objects.get(account=account)

            return Response({
                "match": True,
                "official_id": official.of_id,
                "name": official.full_name,
                "username": account.username,
                "role": official.of_role
            }, status=status.HTTP_200_OK)
        except Account.DoesNotExist:
            return Response({"match": False, "message": "Invalid username or password"}, status=status.HTTP_404_NOT_FOUND)
        except Official.DoesNotExist:
            return Response({"match": False, "message": "Linked official not found"}, status=status.HTTP_404_NOT_FOUND)