import tempfile
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from deepface import DeepFace
from PIL import Image
from scipy.spatial.distance import cosine
from rest_framework.throttling import ScopedRateThrottle
import traceback
from scipy.spatial.distance import euclidean 

class UserCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            try:
                print(f"[INFO] Generating embedding for user {user.name}")
                embeddings = DeepFace.represent(
                    img_path=user.photo.path,
                    model_name="ArcFace",
                    enforce_detection=True
                )

                # Handle if DeepFace returns just a single embedding list
                if isinstance(embeddings, list) and isinstance(embeddings[0], dict):
                    embedding_vector = embeddings[0]["embedding"]
                    
                elif isinstance(embeddings, dict) and "embedding" in embeddings:
                    embedding_vector = embeddings["embedding"]
                else:
                    embedding_vector = embeddings  # fallback if it's a list of floats

                user.embedding = embedding_vector
                user.save()
                print(f"[SUCCESS] Embedding saved for {user.name}")
            except Exception as e:
                print(f"[ERROR] Failed to generate embedding for {user.name}: {str(e)}")
                traceback.print_exc()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("[ERROR] Invalid data for user creation")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    

# class FaceLoginView(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#     throttle_classes = [ScopedRateThrottle]
#     throttle_scope = 'face_login'

#     def post(self, request):
#         uploaded_file = request.FILES.get('photo', None)
#         if not uploaded_file:
#             print("[ERROR] No photo uploaded")
#             return Response({"error": "No photo uploaded."}, status=status.HTTP_400_BAD_REQUEST)

#         temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#         try:
#             # Save uploaded image to temp file
#             image = Image.open(uploaded_file).convert("RGB")
#             image.save(temp_image, format="JPEG")
#             temp_image.flush()
#             temp_image.close()

#             print(f"[INFO] Analyzing uploaded image for login")
#             embedding_result = DeepFace.represent(
#                 img_path=temp_image.name,
#                 model_name="ArcFace", 
#                 enforce_detection=True
#             )

#             # Handle all possible return formats
#             if isinstance(embedding_result, list) and isinstance(embedding_result[0], dict):
#                 uploaded_embedding = embedding_result[0]["embedding"]
#             elif isinstance(embedding_result, dict) and "embedding" in embedding_result:
#                 uploaded_embedding = embedding_result["embedding"]
#             elif isinstance(embedding_result, list) and all(isinstance(x, float) for x in embedding_result):
#                 uploaded_embedding = embedding_result
#             else:
#                 raise ValueError("Unexpected embedding format from DeepFace.")

#             os.remove(temp_image.name)

#             # --------- Find the closest match ----------
#             closest_user = None
#             closest_distance = float("inf")

#             for user in User.objects.all():
#                 if not user.embedding:
#                     continue

#                 stored_embedding = [float(x) for x in user.embedding]
#                 distance = cosine(uploaded_embedding, stored_embedding)
#                 print(f"[DEBUG] Distance to {user.name}: {distance:.4f}")

#                 if distance < closest_distance:
#                     closest_distance = distance
#                     closest_user = user

#             # Decide based on best match
#             if closest_user and closest_distance < 0.6:  # <-- Tune threshold here
#                 print(f"[MATCH] Match found: {closest_user.name}")
#                 return Response({
#                     "match": True,
#                     "user_id": closest_user.id,
#                     "name": closest_user.name
#                 }, status=status.HTTP_200_OK)

#             print("[INFO] No matching face found")
#             return Response({"match": False, "message": "No matching face found."}, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             error_msg = str(e)
#             print(f"[ERROR] Face login failed: {error_msg}")
#             traceback.print_exc()

#             # Provide specific suggestions based on common DeepFace errors
#             suggestion = "Face not detected. Please make sure your face is visible and well-lit."

#             if "image too small" in error_msg.lower():
#                 suggestion = "Move closer to the camera."
#             elif "no face detected" in error_msg.lower():
#                 suggestion = "Ensure your face is centered and clearly visible."
#             elif "multiple faces" in error_msg.lower():
#                 suggestion = "Only one face should be in the frame."

#             return Response({
#                 "error": error_msg,
#                 "suggestion": suggestion
#             }, status=status.HTTP_400_BAD_REQUEST)

#         finally:
#             if os.path.exists(temp_image.name):
#                 os.remove(temp_image.name)


class FaceLoginView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'face_login'

    def post(self, request):
        uploaded_file = request.FILES.get('photo', None)
        if not uploaded_file:
            print("[ERROR] No photo uploaded")
            return Response({"error": "No photo uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        try:
            # Save uploaded image to temp file
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

            # Handle DeepFace response
            if isinstance(embedding_result, list) and isinstance(embedding_result[0], dict):
                uploaded_embedding = embedding_result[0]["embedding"]
            elif isinstance(embedding_result, dict) and "embedding" in embedding_result:
                uploaded_embedding = embedding_result["embedding"]
            elif isinstance(embedding_result, list) and all(isinstance(x, float) for x in embedding_result):
                uploaded_embedding = embedding_result
            else:
                raise ValueError("Unexpected embedding format from DeepFace.")

            os.remove(temp_image.name)

            # --------- Find the closest user using Euclidean distance ----------
            closest_user = None
            closest_distance = float("inf")

            for user in User.objects.all():
                if not user.embedding:
                    continue

                stored_embedding = [float(x) for x in user.embedding]
                distance = euclidean(uploaded_embedding, stored_embedding)
                print(f"[DEBUG] Euclidean Distance to {user.name}: {distance:.4f}")

                if distance < closest_distance:
                    closest_distance = distance
                    closest_user = user

            # ✅ Threshold for ArcFace (typical ~10, adjust if needed)
            if closest_user and closest_distance < 10.0:
                print(f"[MATCH] Match found: {closest_user.name}")
                return Response({
                    "match": True,
                    "user_id": closest_user.id,
                    "name": closest_user.name
                }, status=status.HTTP_200_OK)

            print("[INFO] No matching face found")
            return Response({"match": False, "message": "No matching face found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            error_msg = str(e)
            print(f"[ERROR] Face login failed: {error_msg}")
            traceback.print_exc()

            suggestion = "Face not detected. Please make sure your face is visible and well-lit."

            if "image too small" in error_msg.lower():
                suggestion = "Move closer to the camera."
            elif "no face detected" in error_msg.lower():
                suggestion = "Ensure your face is centered and clearly visible."
            elif "multiple faces" in error_msg.lower():
                suggestion = "Only one face should be in the frame."

            return Response({
                "error": error_msg,
                "suggestion": suggestion
            }, status=status.HTTP_400_BAD_REQUEST)

        finally:
            if os.path.exists(temp_image.name):
                os.remove(temp_image.name)