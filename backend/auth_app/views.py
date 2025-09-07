# import tempfile, os
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from shared_model.models import *
# from .serializers import *
# from rest_framework.parsers import MultiPartParser, FormParser
# from deepface import DeepFace
# from PIL import Image
# from rest_framework.throttling import ScopedRateThrottle    
# import traceback
# from scipy.spatial.distance import euclidean 
# from django.utils.crypto import get_random_string
# from vawsafe_core.blink_model.blink_utils import detect_blink


# class create_official(APIView):
#     parser_classes = [MultiPartParser, FormParser]  

#     def post(self, request):
#         serializer = OfficialSerializer(data=request.data)
#         if not serializer.is_valid():
#             print("[ERROR] Invalid data for Official creation")
#             print(serializer.errors)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         # Step 1: Create account + official
#         fname = request.data.get("of_fname", "").lower()
#         lname = request.data.get("of_lname", "").lower()
#         generated_username = f"{fname}{lname}"
#         generated_password = get_random_string(length=12)

#         account = Account.objects.create(username=generated_username, password=generated_password)
#         official = Official.objects.create(account=account, **serializer.validated_data)

#         # Step 2: Load photos
#         photo_files = request.FILES.getlist("of_photos")  
#         if not photo_files:
#             single_photo = request.FILES.get("of_photo")
#             if single_photo:                                
#                 photo_files = [single_photo]   #

#         if not photo_files:
#             print("[WARN] No photo(s) provided for face samples")
#             return Response({"error": "At least one face photo is required."}, status=status.HTTP_400_BAD_REQUEST)

#         # Save first photo as profile image
#         official.of_photo = photo_files[0]  
#         official.save()

#         # Step 3: Process embeddings
#         created_count = 0   
#         for index, file in enumerate(photo_files):
#             temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") 
#             try:
#                 image = Image.open(file).convert("RGB")   
#                 image.save(temp_image, format="JPEG")
#                 temp_image.flush()
#                 temp_image.close()

#                 embeddings = DeepFace.represent(  
#                     img_path=temp_image.name,
#                     model_name="ArcFace",
#                     enforce_detection=True
#                 )

#                 if isinstance(embeddings, list):
#                     if isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
#                         embedding_vector = embeddings[0]["embedding"]
#                     elif all(isinstance(x, float) for x in embeddings):
#                         embedding_vector = embeddings
#                     else:
#                         raise ValueError("Unexpected list format from DeepFace.")
#                 elif isinstance(embeddings, dict) and "embedding" in embeddings:
#                     embedding_vector = embeddings["embedding"]
#                 else:
#                     raise ValueError("Unexpected format from DeepFace.represent()")

#                 OfficialFaceSample.objects.create(   
#                     official=official,
#                     photo=file,
#                     embedding=embedding_vector
#                 )
#                 created_count += 1  #1 row per photo 
#                 print(f"[INFO] Face sample #{index + 1} saved for {official.full_name}")

#             except Exception as e:
#                 print(f"[ERROR] Failed to process face sample #{index + 1}: {str(e)}")
#                 traceback.print_exc()
#             finally:
#                 if os.path.exists(temp_image.name):
#                     os.remove(temp_image.name)

#         if created_count == 0:
#             return Response({"error": "Face registration failed. Please upload clearer photos."}, status=status.HTTP_400_BAD_REQUEST)

#         return Response({
#             "message": f" Registration successful. {created_count} face sample(s) saved.",
#             "official_id": official.of_id,
#             "username": generated_username,
#             "password": generated_password,
#             "role": official.of_role,
#             "photo_url": official.of_photo.url if official.of_photo else None
#         }, status=status.HTTP_201_CREATED)

# class face_login(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#     throttle_classes = [ScopedRateThrottle]
#     throttle_scope = 'face_login'

#     def post(self, request):
#         uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
#         if not uploaded_frames:
#             return Response({"error": "No frame(s) provided"}, status=status.HTTP_400_BAD_REQUEST)

#         best_match = None
#         best_sample = None
#         lowest_distance = float("inf")

#         try:
#             # Loop over candidate frames (blink ±1 from frontend)
#             for file in uploaded_frames:
#                 temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#                 image = Image.open(file).convert("RGB")
#                 image.save(temp_image, format="JPEG")
#                 temp_image.flush()
#                 temp_image.close()

#                 try:
#                     for sample in OfficialFaceSample.objects.select_related("official"):
#                         try:
#                             result = DeepFace.verify(
#                                 img1_path=temp_image.name,
#                                 img2_path=sample.photo.path,
#                                 model_name="ArcFace",
#                                 enforce_detection=True
#                             )
#                             official = sample.official
#                             # ✅ Always print distance and verified (True/False)
#                             print(f"[DEBUG] Compared {official.full_name}, distance={result['distance']:.4f}, verified={result['verified']}")

#                             if result["verified"] and result["distance"] < lowest_distance:
#                                 lowest_distance = result["distance"]
#                                 best_match = official
#                                 best_sample = sample

#                         except Exception as ve:
#                             print(f"[WARN] Skipping {sample.official.full_name}: {ve}")
#                             continue

#                 finally:
#                     if os.path.exists(temp_image.name):
#                         os.remove(temp_image.name)

#             if best_match:
#                 print(f"[MATCH] Found {best_match.full_name} (Distance={lowest_distance:.4f})")

#                 if getattr(best_match, "of_photo", None) and best_match.of_photo:
#                     rel_url = best_match.of_photo.url
#                 elif best_sample and best_sample.photo:
#                     rel_url = best_sample.photo.url
#                 else:
#                     rel_url = None

#                 profile_photo_url = request.build_absolute_uri(rel_url) if rel_url else None

#                 return Response({
#                     "match": True,
#                     "official_id": best_match.of_id,
#                     "name": best_match.full_name,
#                     "fname": best_match.of_fname,
#                     "lname": best_match.of_lname,
#                     "username": best_match.account.username,
#                     "role": best_match.of_role,
#                     "profile_photo_url": profile_photo_url
#                 }, status=200)

#             print("[INFO] No matching face found")
#             return Response({"match": False, "message": "No matching face found."}, status=404)

#         except Exception as e:
#             traceback.print_exc()
#             return Response({
#                 "match": False,
#                 "error": str(e),
#                 "suggestion": "Something went wrong with face verification."
#             }, status=400)


# class blick_check(APIView):
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
#         if not uploaded_frames:
#             return Response({"error": "No frames received"}, status=400)

#         for i, file in enumerate(uploaded_frames):
#             try:
#                 temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#                 image = Image.open(file).convert("RGB")
#                 image.save(temp_image, format="JPEG")
#                 temp_image.flush()
#                 temp_image.close()

#                 with open(temp_image.name, "rb") as f:
#                     image_bytes = f.read()

#                 if detect_blink(image_bytes):
#                     os.remove(temp_image.name)  # cleanup temp

#                     #  Return blink index + candidate indices
#                     candidate_indices = [i]
#                     if i > 0:
#                         candidate_indices.insert(0, i - 1)
#                     if i < len(uploaded_frames) - 1:
#                         candidate_indices.append(i + 1)

#                     return Response({
#                         "blink": True,
#                         "frame_index": i,
#                         "candidate_indices": candidate_indices
#                     }, status=200)

#                 else:
#                     os.remove(temp_image.name)

#             except Exception as e:
#                 print(f"[WARN] Blink check failed: {e}")
#                 continue

#         return Response({
#             "blink": False,
#             "message": "No blink detected. Please blink clearly."
#         }, status=403)

# class manual_login(APIView):
#     def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")

#         try:
#             account = Account.objects.get(username=username, password=password)
#             official = Official.objects.get(account=account)

#             return Response({
#             "match": True,
#             "official_id": official.of_id,
#             "name": official.full_name,
#             "username": account.username,
#             "role": official.of_role,
#             "profile_photo_url": request.build_absolute_uri(official.of_photo.url) if official.of_photo else None,
#         }, status=200)
#         except Account.DoesNotExist:
#             return Response({"match": False, "message": "Invalid username or password"}, status=status.HTTP_404_NOT_FOUND)
#         except Official.DoesNotExist:
#             return Response({"match": False, "message": "Linked official not found"}, status=status.HTTP_404_NOT_FOUND)


# auth_app/views.py
import tempfile, os, traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from shared_model.models import Official, OfficialFaceSample
from .serializers import OfficialSerializer, OfficialFaceSampleSerializer
from deepface import DeepFace
from PIL import Image
from django.utils.crypto import get_random_string
from vawsafe_core.blink_model.blink_utils import detect_blink
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

class create_official(APIView):
    """
    NOTE: this endpoint currently allows unauthenticated creation.
    In production you should restrict this to IsAdminUser / staff.
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OfficialSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Build unique username from fname+lname
        fname = request.data.get("of_fname", "").strip().lower()
        lname = request.data.get("of_lname", "").strip().lower()
        base_username = f"{fname}{lname}".replace(" ", "")
        username = base_username or get_random_string(8)

        # ensure uniqueness
        counter = 0
        while User.objects.filter(username=username).exists():
            counter += 1
            username = f"{base_username}{counter}"

        generated_password = get_random_string(length=12)

        # create Django User (hashed password)
        user = User.objects.create_user(username=username, password=generated_password)

        # create Official record
        official = Official.objects.create(user=user, **serializer.validated_data)

        # Photos - support of_photos[] or single of_photo
        photo_files = request.FILES.getlist("of_photos") or []
        if not photo_files:
            single_photo = request.FILES.get("of_photo")
            if single_photo:
                photo_files = [single_photo]

        if photo_files:
            official.of_photo = photo_files[0]
            official.save()

        # Process embeddings (DeepFace) and save OfficialFaceSample rows
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

                # Normalize DeepFace.represent output to list of floats
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

                OfficialFaceSample.objects.create(
                    official=official,
                    photo=file,
                    embedding=embedding_vector
                )
                created_count += 1

            except Exception as e:
                traceback.print_exc()
            finally:
                if os.path.exists(temp_image.name):
                    os.remove(temp_image.name)

        if created_count == 0:
            return Response({"error": "Face registration failed. Please upload clearer photos."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": f"Registration successful. {created_count} face sample(s) saved.",
            "official_id": official.of_id,
            "username": username,
            "password": generated_password,
            "role": official.of_role,
            "photo_url": request.build_absolute_uri(official.of_photo.url) if official.of_photo else None
        }, status=status.HTTP_201_CREATED)


class face_login(APIView):
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'face_login'
    permission_classes = [AllowAny]

    def post(self, request):
        uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
        if not uploaded_frames:
            return Response({"error": "No frame(s) provided"}, status=status.HTTP_400_BAD_REQUEST)

        best_match = None
        best_sample = None
        lowest_distance = float("inf")

        try:
            for file in uploaded_frames:
                temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                image = Image.open(file).convert("RGB")
                image.save(temp_image, format="JPEG")
                temp_image.flush()
                temp_image.close()

                try:
                    for sample in OfficialFaceSample.objects.select_related("official"):
                        try:
                            result = DeepFace.verify(
                                img1_path=temp_image.name,
                                img2_path=sample.photo.path,
                                model_name="ArcFace",
                                enforce_detection=True
                            )
                            official = sample.official
                            print(f"[DEBUG] Compared {official.full_name}, distance={result.get('distance')}, verified={result.get('verified')}")

                            if result.get("verified") and result.get("distance", float("inf")) < lowest_distance:
                                lowest_distance = result["distance"]
                                best_match = official
                                best_sample = sample

                        except Exception as ve:
                            print(f"[WARN] Skipping {sample.official.full_name}: {ve}")
                            continue

                finally:
                    if os.path.exists(temp_image.name):
                        os.remove(temp_image.name)

            if best_match:
                # create tokens for matched user
                tokens = get_tokens_for_user(best_match.user)
                if getattr(best_match, "of_photo", None) and best_match.of_photo:
                    rel_url = best_match.of_photo.url
                elif best_sample and best_sample.photo:
                    rel_url = best_sample.photo.url
                else:
                    rel_url = None

                profile_photo_url = request.build_absolute_uri(rel_url) if rel_url else None

                return Response({
                    "match": True,
                    "official_id": best_match.of_id,
                    "name": best_match.full_name,
                    "fname": best_match.of_fname,
                    "lname": best_match.of_lname,
                    "username": best_match.user.username,
                    "role": best_match.of_role,
                    "profile_photo_url": profile_photo_url,
                    "tokens": tokens
                }, status=200)

            return Response({"match": False, "message": "No matching face found."}, status=404)

        except Exception as e:
            traceback.print_exc()
            return Response({"match": False, "error": str(e)}, status=400)


class blick_check(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
        if not uploaded_frames:
            return Response({"error": "No frames received"}, status=400)

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
                    os.remove(temp_image.name)
                    candidate_indices = [i]
                    if i > 0:
                        candidate_indices.insert(0, i - 1)
                    if i < len(uploaded_frames) - 1:
                        candidate_indices.append(i + 1)

                    return Response({
                        "blink": True,
                        "frame_index": i,
                        "candidate_indices": candidate_indices
                    }, status=200)
                else:
                    os.remove(temp_image.name)
            except Exception as e:
                print(f"[WARN] Blink check failed: {e}")
                continue

        return Response({
            "blink": False,
            "message": "No blink detected. Please blink clearly."
        }, status=403)


class manual_login(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"match": False, "message": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            official = Official.objects.get(user=user)
        except Official.DoesNotExist:
            return Response({"match": False, "message": "Linked official not found"}, status=status.HTTP_404_NOT_FOUND)

        tokens = get_tokens_for_user(user)
        return Response({
            "match": True,
            "official_id": official.of_id,
            "name": official.full_name,
            "username": user.username,
            "role": official.of_role,
            "profile_photo_url": request.build_absolute_uri(official.of_photo.url) if official.of_photo else None,
            "tokens": tokens
        }, status=200)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        # attach user info + official role if exists
        user_info = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        try:
            official = Official.objects.get(user=user)
            user_info.update({
                "official_id": official.of_id,
                "role": official.of_role
            })
        except Official.DoesNotExist:
            user_info.update({"official_id": None, "role": None})

        data["user"] = user_info
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer