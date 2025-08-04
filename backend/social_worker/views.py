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
from vawsafe_core.blink_model.blink_utils import detect_blink


class UserCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = OfficialSerializer(data=request.data)
        if not serializer.is_valid():
            print("[ERROR] Invalid data for Official creation")
            print(serializer.errors) 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Create account + official
        fname = request.data.get("of_fname", "").lower()
        lname = request.data.get("of_lname", "").lower()
        generated_username = f"{fname}{lname}"
        generated_password = get_random_string(length=12)

        account = Account.objects.create(username=generated_username, password=generated_password)
        official = Official.objects.create(account=account, **serializer.validated_data)

        # Step 2: Load face images (support: of_photo or of_photos[])
        photo_files = request.FILES.getlist("of_photos")
        if not photo_files:
            single_photo = request.FILES.get("of_photo")
            if single_photo:
                photo_files = [single_photo]

        if not photo_files:
            print("[WARN] No photo(s) provided for face samples")
            return Response({"error": "At least one face photo is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Process and save embeddings
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

                #  Safe extraction logic
                if isinstance(embeddings, list):
                    if isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
                        embedding_vector = embeddings[0]["embedding"]
                    elif all(isinstance(x, float) for x in embeddings):
                        embedding_vector = embeddings
                    else:
                        raise ValueError("Unexpected list format from DeepFace.")
                elif isinstance(embeddings, dict) and "embedding" in embeddings:
                    embedding_vector = embeddings["embedding"]
                else:
                    raise ValueError("Unexpected format from DeepFace.represent()")

                # Save as official face sample
                OfficialFaceSample.objects.create(
                    official=official,
                    photo=file,
                    embedding=embedding_vector
                )
                created_count += 1
                print(f"[INFO] Face sample #{index + 1} saved for {official.full_name}")

            except Exception as e:
                print(f"[ERROR] Failed to process face sample #{index + 1}: {str(e)}")
                traceback.print_exc()
            finally:
                if os.path.exists(temp_image.name):
                    os.remove(temp_image.name)

        if created_count == 0:
            print("[ERROR] No valid face samples saved")
            return Response({"error": "Face registration failed. Please upload clearer photos."}, status=status.HTTP_400_BAD_REQUEST)

        print(f"[SUCCESS] {created_count} face sample(s) saved for {official.full_name}")
        return Response({
            "message": f"✅ Registration successful. {created_count} face sample(s) saved.",
            "official_id": official.of_id,
            "username": generated_username,
            "password": generated_password,
            "role": official.of_role
        }, status=status.HTTP_201_CREATED)
    

class FaceLoginView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'face_login'

    def post(self, request):
        # Accept multiple uploaded frames (frame1, frame2, ..., frame10)
        uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]

        if not uploaded_frames:
            return Response({"error": "No webcam frames received."}, status=status.HTTP_400_BAD_REQUEST)

        print(f"[INFO] {len(uploaded_frames)} frames received for blink detection")

        blink_detected = False
        chosen_frame = None

        for i, file in enumerate(uploaded_frames):
            try:
                temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                image = Image.open(file).convert("RGB")
                image.save(temp_image, format="JPEG")
                temp_image.flush()
                temp_image.close()

                with open(temp_image.name, "rb") as f:
                    image_bytes = f.read()

                if detect_blink(image_bytes):
                    blink_detected = True
                    chosen_frame = temp_image.name
                    print(f"[LIVENESS] Blink detected in frame {i + 1}")
                    break
                else:
                    os.remove(temp_image.name)

            except Exception as e:
                print(f"[WARN] Failed to process frame {i + 1}: {e}")
                continue

        if not blink_detected:
            return Response({
                "match": False,
                "error": "No blink detected in any frame.",
                "suggestion": "Please blink clearly in front of the camera."
            }, status=status.HTTP_403_FORBIDDEN)

        # Run DeepFace match using the frame where blink was detected
        print("[INFO] Verifying blink-confirmed image against all samples")
        best_match = None
        lowest_distance = float("inf")

        try:
            for sample in OfficialFaceSample.objects.select_related("official"):
                try:
                    result = DeepFace.verify(
                        img1_path=chosen_frame,
                        img2_path=sample.photo.path,
                        model_name="ArcFace",
                        enforce_detection=True
                    )

                    official = sample.official
                    print(f"[DEBUG] Compared with {official.full_name}, distance: {result['distance']:.4f}, verified: {result['verified']}")

                    if result["verified"] and result["distance"] < lowest_distance:
                        lowest_distance = result["distance"]
                        best_match = official

                except Exception as ve:
                    print(f"[WARN] Skipping {sample.official.full_name} due to error: {str(ve)}")
                    continue

            if best_match:
                print(f"[MATCH] Found: {best_match.full_name} (Distance: {lowest_distance:.4f})")
                return Response({
                    "match": True,
                    "official_id": best_match.of_id,
                    "fname": best_match.of_fname,
                    "lname": best_match.of_lname,
                    "username": best_match.account.username,
                    "role": best_match.of_role
                }, status=status.HTTP_200_OK)

            print("[INFO] No matching face found")
            return Response({
                "match": False,
                "message": "No matching face found. Try again or use alternative login."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            traceback.print_exc()
            return Response({
                "match": False,
                "error": str(e),
                "suggestion": "Something went wrong with face verification."
            }, status=status.HTTP_400_BAD_REQUEST)

        finally:
            if chosen_frame and os.path.exists(chosen_frame):
                os.remove(chosen_frame)

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
                       
# class FaceLoginView(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#     throttle_classes = [ScopedRateThrottle]
#     throttle_scope = 'face_login'

#     def post(self, request):
#         uploaded_file = request.FILES.get('photo', None)
#         if not uploaded_file:
#             return Response({"error": "No photo uploaded."}, status=status.HTTP_400_BAD_REQUEST)

#         temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#         try:
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

#             if isinstance(embedding_result, list) and isinstance(embedding_result[0], dict):
#                 uploaded_embedding = embedding_result[0]["embedding"]
#             elif isinstance(embedding_result, dict) and "embedding" in embedding_result:
#                 uploaded_embedding = embedding_result["embedding"]
#             elif isinstance(embedding_result, list) and all(isinstance(x, float) for x in embedding_result):
#                 uploaded_embedding = embedding_result
#             else:
#                 raise ValueError("Unexpected embedding format from DeepFace.")

#             os.remove(temp_image.name)

#             # Compare with all registered officials
#             closest_official = None
#             closest_distance = float("inf")

#             for official in Official.objects.exclude(of_embedding=None):
#                 stored_embedding = [float(x) for x in official.of_embedding]
#                 distance = euclidean(uploaded_embedding, stored_embedding)
#                 print(f"[DEBUG] Distance to {official.of_fname} {official.of_lname}: {distance:.4f}")

#                 if distance < closest_distance:
#                     closest_distance = distance
#                     closest_official = official

#             if closest_official and closest_distance < 10.0:
#                 print(f"[MATCH] Found: {closest_official.of_fname} {closest_official.of_lname}")
#                 return Response({
#                     "match": True,
#                     "official_id": closest_official.of_id,
#                     "fname": closest_official.of_fname,
#                     "lname": closest_official.of_lname,
#                     "username": closest_official.account.username,
#                     "role": closest_official.of_role
#                 }, status=status.HTTP_200_OK)

#             print("[INFO] No matching face found")
#             return Response({
#                 "match": False,
#                 "message": "No matching face found. Try again or use alternative login."
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             error_msg = str(e)
#             traceback.print_exc()

#             suggestion = "Face not detected. Please make sure your face is visible and well-lit."
#             if "image too small" in error_msg.lower():
#                 suggestion = "Move closer to the camera."
#             elif "no face detected" in error_msg.lower():
#                 suggestion = "Ensure your face is centered and clearly visible."
#             elif "multiple faces" in error_msg.lower():
#                 suggestion = "Only one face should be in the frame."

#             return Response({
#                 "match": False,
#                 "error": error_msg,
#                 "suggestion": suggestion
#             }, status=status.HTTP_400_BAD_REQUEST)

#         finally:
#             if os.path.exists(temp_image.name):
#                 os.remove(temp_image.name)



