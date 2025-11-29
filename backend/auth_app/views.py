import tempfile, os, traceback
from django.db import transaction
import numpy as np
import cv2
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, views
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.exceptions import Throttled
from rest_framework_simplejwt.tokens import RefreshToken
from shared_model.models import Official, OfficialFaceSample, LoginTracker, AuditLog
from shared_model.permissions import AllowSetupOrAdmin
from .serializers import OfficialSerializer
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from django.core.mail import send_mail
from django.conf import settings
from .cookie_utils import set_auth_cookies, clear_auth_cookies
from django.utils.decorators import method_decorator
from rest_framework import viewsets
from .signals import get_client_ip
from django.http import Http404
from shared_model.views import serve_encrypted_file

from .login_protection import (
    increment_ip_fail,
    increment_user_fail,
    reset_ip_failures,
    reset_user_failures,
    is_ip_blocked,
    is_user_locked,
    block_ip,
    lockout_user,
    get_user_fails,
    get_ip_fails,
    MAX_FAILED_PER_IP,
    MAX_FAILED_PER_USERNAME,
)

import logging

from deepface import DeepFace
from PIL import Image
import random, string
from vawsafe_core.blink_model.blink_utils import detect_blink
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

#gamit ni sa cookies
# 1) Whoami (used by frontend to restore session)
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@throttle_classes([ScopedRateThrottle])
@ensure_csrf_cookie
def me(request):
    request.throttle_scope = 'safe_read'
    user = request.user if request.user.is_authenticated else None
    if not user:
        return Response({"authenticated": False}, status=200)

    try:
        official = user.official
    except Official.DoesNotExist:
        official = None

    if not official:
        return Response({"authenticated": False}, status=200)

    role = getattr(official, "of_role", None)
    name = getattr(official, "full_name", f"{getattr(official, 'of_fname', '')} {getattr(official, 'of_lname', '')}".strip())
    official_id = getattr(official, "of_id", None)

    # Get the profile photo URL
    of_photo = getattr(official, "of_photo", None)
    if of_photo:
        of_photo_url = of_photo.url  # Access the .url property to get the URL of the image
    else:
        of_photo_url = None  # If no photo, return None or a default URL

    return Response({
        "authenticated": True,
        "user": {
            "username": user.username,
            "role": role,
            "name": name,
            "official_id": official_id,
            "of_photo": of_photo_url,  # Return the URL of the photo
        }
    }, status=200)

#para sa dswd check if naa ba user sa dswd or official
@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def check_dswd_exists(request):
    request.throttle_scope = 'safe_read'
    exists = Official.objects.filter(of_role="DSWD").exists()
    return Response({"dswd_exists": exists})

#========================================================

#check face user first
#unya nani i work kanang wa na sa dev phase
# class SearchOfficialFacial(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#     permission_classes = [AllowAny]

#     def decrypt_temp_file(self, encrypted_path):
#         """Decrypt .enc image into a temporary .jpg file."""
#         fernet = Fernet(settings.FERNET_KEY)
#         try:
#             with open(encrypted_path, "rb") as enc_file:
#                 encrypted_data = enc_file.read()
#             decrypted_data = fernet.decrypt(encrypted_data)

#             # Save the decrypted data to a temporary file with delete=True
#             temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#             temp.write(decrypted_data)
#             temp.flush()
#             temp.close()

#             return temp.name
#         except Exception as e:
#             print(f"Error decrypting file {encrypted_path}: {e}")
#             return None

#     def post(self, request):
#         uploaded_files = request.FILES.getlist("of_photos")

#         if not uploaded_files:
#             return Response({"error": "No images uploaded."}, status=status.HTTP_400_BAD_REQUEST)

#         # Save the temporary images
#         chosen_frames = []
#         for uploaded_file in uploaded_files:
#             try:
#                 temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#                 temp_image.write(uploaded_file.read())
#                 temp_image.flush()
#                 temp_image.close()
#                 chosen_frames.append(temp_image.name)
#             except Exception as e:
#                 return Response({"error": f"Failed to save uploaded image: {str(e)}"}, status=400)

#         best_match = None
#         best_sample = None
#         lowest_distance = float("inf")
#         decrypted_temp_files = []  # List to keep track of decrypted temp files

#         try:
#             for sample in OfficialFaceSample.objects.select_related("official"):
#                 for chosen_frame in chosen_frames:
#                     try:
#                         # Check if the photo is encrypted (.enc)
#                         photo_path = sample.photo.path
#                         if photo_path.lower().endswith(".enc"):
#                             decrypted_photo_path = self.decrypt_temp_file(photo_path)
#                             if decrypted_photo_path:
#                                 photo_path = decrypted_photo_path
#                                 decrypted_temp_files.append(decrypted_photo_path)  # Track decrypted files
#                             else:
#                                 continue  # Skip this sample if decryption fails

#                         result = DeepFace.verify(
#                             img1_path=chosen_frame,
#                             img2_path=photo_path,
#                             model_name="ArcFace",
#                             enforce_detection=True
#                         )

#                         official = sample.official
#                         print(f"[DEBUG] Compared with {official.of_fname} {official.of_lname}, distance: {result['distance']:.4f}, verified: {result['verified']}")

#                         if result["verified"] and result["distance"] < lowest_distance:
#                             lowest_distance = result["distance"]
#                             best_match = official
#                             best_sample = sample

#                     except Exception as ve:
#                         print(f"[WARN] Skipping {sample.official.of_fname} {sample.official.of_lname} due to error: {str(ve)}")
#                         continue

#             if best_match:
#                 serializer = OfficialSerializer(best_match, context={"request": request})
#                 return Response({
#                     "match": True,
#                     "official_id": best_match.of_id,
#                     "official_data": serializer.data
#                 }, status=status.HTTP_200_OK)

#             return Response({
#                 "match": False,
#                 "message": "The official is not registered."
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             traceback.print_exc()
#             return Response({
#                 "match": False,
#                 "error": str(e),
#                 "suggestion": "Something went wrong with face verification."
#             }, status=status.HTTP_400_BAD_REQUEST)

#         finally:
#             # Clean up the temporary image files
#             for chosen_frame in chosen_frames:
#                 if os.path.exists(chosen_frame):
#                     os.remove(chosen_frame)

#             # Clean up decrypted temp files after comparison
#             for f in decrypted_temp_files:
#                 if os.path.exists(f):
#                     os.remove(f)

def generate_strong_password(length=16):
    if length < 16:
        raise ValueError("Password length must be at least 16 characters.")

    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special_characters = string.punctuation

    # Ensure that password contains at least one character from each set
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(special_characters),
    ]

    # Fill the rest of the password length with random choices from all sets
    remaining_length = length - len(password)
    all_characters = lowercase + uppercase + digits + special_characters
    password += random.choices(all_characters, k=remaining_length)

    # Shuffle the result to ensure randomness
    random.shuffle(password)

    # Return the password as a string
    return ''.join(password)
    

class create_official(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowSetupOrAdmin]

    def post(self, request):
        # -----------------------
        # Validate incoming data
        # -----------------------
        serializer = OfficialSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        role = serializer.validated_data.get("of_role", "").strip()
        fname = request.data.get("of_fname", "").strip().lower()
        lname = request.data.get("of_lname", "").strip().lower()
        base_username = f"{fname}{lname}".replace(" ", "") or generate_strong_password(16)

        photo_files = request.FILES.getlist("of_photos")
        if not photo_files:
            single_photo = request.FILES.get("of_photo")
            if single_photo:
                photo_files = [single_photo]

        if not photo_files:
            return Response({"error": "At least one face photo is required."}, status=status.HTTP_400_BAD_REQUEST)

        # -----------------------
        # Process face embeddings
        # -----------------------
        embeddings_success_count = 0
        temp_embeddings_data = []

        for file in photo_files:
            temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            try:
                image = Image.open(file).convert("RGB")
                image.save(temp_image, format="JPEG")
                temp_image.flush()
                temp_image.close()

                try:
                    embeddings = DeepFace.represent(
                        img_path=temp_image.name,
                        model_name="ArcFace",
                        enforce_detection=True
                    )
                except ValueError as e:
                    # This is triggered when no face is detected
                    return Response(
                        {"error": "Face could not be detected. Please upload a clear face photo."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                except Exception as e:
                    # Catch-all for other DeepFace or unexpected errors
                    return Response(
                        {"error": "Face recognition failed. Please try again."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                # normalize output
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

                temp_embeddings_data.append({
                    "photo": file,
                    "embedding": embedding_vector
                })
                embeddings_success_count += 1

            except Exception as e:
                traceback.print_exc()
            finally:
                if os.path.exists(temp_image.name):
                    os.remove(temp_image.name)

        if embeddings_success_count == 0:
            return Response(
                {"error": "Face registration failed. Please upload clearer photos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------
        # Create User account
        # -----------------------
        username = base_username
        counter = 0
        while User.objects.filter(username=username).exists():
            counter += 1
            username = f"{base_username}{counter}"

        generated_password = generate_strong_password(length=16)
        user = User.objects.create_user(username=username, password=generated_password)

        # -----------------------
        # Save Official
        # -----------------------
        status_value = "approved" if role in ["DSWD", "Social Worker", "Nurse", "Psychometrician"] else "pending"
        official = serializer.save(user=user, status=status_value)
        official.of_photo = photo_files[0]
        official.save()

        # -----------------------
        # Create Audit Log Entry
        # -----------------------
        AuditLog.objects.create(
            actor=request.user if request.user.is_authenticated else None,  # admin who created the account
            action="create",  # <-- you should add this to ACTION_CHOICES
            target_model="Official",
            target_id=official.of_id,
            reason=f"Created new official account: {official.of_fname} {official.of_lname}",
            changes={
                "created_fields": {
                    "fname": official.of_fname,
                    "lname": official.of_lname,
                    "role": official.of_role,
                    "status": official.status,
                    "username": user.username,
                }
            }
        )

        # -----------------------
        # Save face embeddings
        # -----------------------
        for data in temp_embeddings_data:
            OfficialFaceSample.objects.create(
                official=official,
                photo=data["photo"],
                embedding=data["embedding"]
            )

        # -----------------------
        # Send credentials email (optional)
        # -----------------------
        email_address = serializer.validated_data.get("of_email")
        if email_address:
            subject = f"Your {role} Account Credentials"
            message = (
                f"Hello {official.of_fname} {official.of_lname},\n\n"
                f"Your {role} account has been created and approved.\n\n"
                f"Username: {username}\n"
                f"Password: {generated_password}\n\n"
                f"Please log in and change your password immediately."
            )
            try:
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email_address], fail_silently=True)
            except Exception as e:
                print("Email sending failed:", e)

        return Response({
            "message": f"{role} registered. {embeddings_success_count} face sample(s) saved.",
            "official_id": official.of_id,
            "username": username,
            "password": generated_password,
            "role": official.of_role,
            "photo_url": request.build_absolute_uri(official.of_photo.url) if official.of_photo else None,
        }, status=status.HTTP_201_CREATED)

# class create_official(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#     permission_classes = [AllowAny]

#     def post(self, request):
#         # -----------------------
#         # Validate data
#         # -----------------------
#         serializer = OfficialSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         role = serializer.validated_data.get("of_role", "").strip()
#         user = None
#         username = None
#         generated_password = None
#         status_value = "pending"

#         # -----------------------
#         # Account creation logic
#         # -----------------------
#         if role == "DSWD":
#             if Official.objects.filter(of_role="DSWD").exists():
#                 return Response(
#                     {"error": "A DSWD account already exists. Cannot create another."},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )

#             fname = request.data.get("of_fname", "").strip().lower()
#             lname = request.data.get("of_lname", "").strip().lower()
#             base_username = f"{fname}{lname}".replace(" ", "") or generate_strong_password(16)

#             # Ensure unique username
#             username = base_username
#             counter = 0
#             while User.objects.filter(username=username).exists():
#                 counter += 1
#                 username = f"{base_username}{counter}"

#             generated_password = generate_strong_password(length=16)
#             user = User.objects.create_user(username=username, password=generated_password)
#             status_value = "approved"

#         elif role == "Social Worker":
#             fname = request.data.get("of_fname", "").strip().lower()
#             lname = request.data.get("of_lname", "").strip().lower()
#             base_username = f"{fname}{lname}".replace(" ", "") or generate_strong_password(16)

#             username = base_username
#             counter = 0
#             while User.objects.filter(username=username).exists():
#                 counter += 1
#                 username = f"{base_username}{counter}"

#             generated_password = generate_strong_password(length=16)
#             user = User.objects.create_user(username=username, password=generated_password)
#             status_value = "approved"

#         elif role == "Nurse":
#             fname = request.data.get("of_fname", "").strip().lower()
#             lname = request.data.get("of_lname", "").strip().lower()
#             base_username = f"{fname}{lname}".replace(" ", "") or generate_strong_password(16)

#             username = base_username
#             counter = 0
#             while User.objects.filter(username=username).exists():
#                 counter += 1
#                 username = f"{base_username}{counter}"

#             generated_password = generate_strong_password(length=16)
#             user = User.objects.create_user(username=username, password=generated_password)
#             status_value = "approved"

#         elif role == "Psychometrician":
#             fname = request.data.get("of_fname", "").strip().lower()
#             lname = request.data.get("of_lname", "").strip().lower()
#             base_username = f"{fname}{lname}".replace(" ", "") or generate_strong_password(16)

#             username = base_username
#             counter = 0
#             while User.objects.filter(username=username).exists():
#                 counter += 1
#                 username = f"{base_username}{counter}"

#             generated_password = generate_strong_password(length=16)
#             user = User.objects.create_user(username=username, password=generated_password)
#             status_value = "approved"
#         else:
#             return Response({"error": f"Invalid role: {role}"}, status=status.HTTP_400_BAD_REQUEST)

#         # -----------------------
#         # Create Official with serializer.save()
#         # -----------------------
#         official = serializer.save(
#             user=user,
#             status=status_value
#         )

#         if not official:
#             return Response({"error": "Failed to create official."}, status=status.HTTP_400_BAD_REQUEST)

#         # -----------------------
#         # Handle uploaded photos
#         # -----------------------
#         photo_files = request.FILES.getlist("of_photos")
#         if not photo_files:
#             single_photo = request.FILES.get("of_photo")
#             if single_photo:
#                 photo_files = [single_photo]

#         if photo_files:
#             # store first photo in of_photo field
#             official.of_photo = photo_files[0]
#             official.save()

#         # -----------------------
#         # Face Embeddings (Social Worker / DSWD / Nurse / Psychometrician only)
#         # -----------------------
#         if role in ["Social Worker", "DSWD", "Nurse", "Psychometrician"]:
#             created_count = 0
#             for file in photo_files:
#                 temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
#                 try:
#                     image = Image.open(file).convert("RGB")
#                     image.save(temp_image, format="JPEG")
#                     temp_image.flush()
#                     temp_image.close()

#                     embeddings = DeepFace.represent(
#                         img_path=temp_image.name,
#                         model_name="ArcFace",
#                         enforce_detection=True
#                     )

#                     # normalize output
#                     if isinstance(embeddings, list):
#                         if isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
#                             embedding_vector = embeddings[0]["embedding"]
#                         elif all(isinstance(x, float) for x in embeddings):
#                             embedding_vector = embeddings
#                         else:
#                             raise ValueError("Unexpected list format from DeepFace.")
#                     elif isinstance(embeddings, dict) and "embedding" in embeddings:
#                         embedding_vector = embeddings["embedding"]
#                     else:
#                         raise ValueError("Unexpected format from DeepFace.represent()")

#                     OfficialFaceSample.objects.create(
#                         official=official,
#                         photo=file,
#                         embedding=embedding_vector
#                     )
#                     created_count += 1

#                 except Exception as e:
#                     traceback.print_exc()
#                 finally:
#                     if os.path.exists(temp_image.name):
#                         os.remove(temp_image.name)

#             if created_count == 0:
#                 return Response(
#                     {"error": "Face registration failed. Please upload clearer photos."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Send credentials by email
#             email_address = serializer.validated_data.get("of_email")
#             if email_address:
#                 subject = f"Your {role} Account Credentials"
#                 message = (
#                     f"Hello {official.of_fname} {official.of_lname},\n\n"
#                     f"Your {role} account has been created and approved.\n\n"
#                     f"Username: {username}\n"
#                     f"Password: {generated_password}\n\n"
#                     f"Please log in and change your password immediately."
#                 )
#                 send_mail(
#                     subject,
#                     message,
#                     settings.DEFAULT_FROM_EMAIL,
#                     [email_address],
#                     fail_silently=False,
#                 )

#             return Response({
#                 "message": f"{role} registered. {created_count} face sample(s) saved.",
#                 "official_id": official.of_id,
#                 "username": username,
#                 "password": generated_password,
#                 "role": official.of_role,
#                 "photo_url": request.build_absolute_uri(official.of_photo.url) if official.of_photo else None,
#             }, status=status.HTTP_201_CREATED)



logger = logging.getLogger(__name__)

class face_login(APIView):
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'face_login'
    permission_classes = [AllowAny]

    SIMILARITY_THRESHOLD = 0.65  # adjust based on testing

    @method_decorator(csrf_protect)  # require CSRF for POST (cookies auth)
    def post(self, request):
        # --- RATE LIMITING SECTION (added at the top) ---
        ip = get_client_ip(request)

        # 1. Block if too many failures from this IP
        if is_ip_blocked(ip):
            return Response(
                {"detail": "Too many attempts from this IP. Try again later."},
                status=429
            )

        # 2. DRF Scoped Throttle (face_login scope)
        try:
            self.check_throttles(request)
        except Throttled as t:
            logger.warning(f"Throttled face login attempt from IP {ip}: {t.detail}")
            return Response({"detail": "Too many requests. Try again later."},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
        if not uploaded_frames:
            increment_ip_fail(ip)
            return Response({"error": "No frame(s) provided"}, status=status.HTTP_400_BAD_REQUEST)

        best_match = None
        best_sample = None
        best_score = -1.0  # cosine similarity (higher = better)

        try:
            for file in uploaded_frames:
                temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                image = Image.open(file).convert("RGB")
                image.save(temp_image, format="JPEG")
                temp_image.flush()
                temp_image.close()

                try:
                    # Generate embedding for uploaded frame
                    embeddings = DeepFace.represent(
                        img_path=temp_image.name,
                        model_name="ArcFace",
                        enforce_detection=True
                    )

                    # Handle different DeepFace.represent() return types
                    frame_embedding = None
                    if isinstance(embeddings, list):
                        if len(embeddings) > 0 and isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
                            frame_embedding = embeddings[0]["embedding"]
                        elif all(isinstance(x, (int, float)) for x in embeddings):
                            frame_embedding = embeddings
                    elif isinstance(embeddings, dict) and "embedding" in embeddings:
                        frame_embedding = embeddings["embedding"]

                    if frame_embedding is None:
                        print(f"[WARN] No usable embedding from {file}")
                        continue

                    frame_embedding = np.array(frame_embedding).reshape(1, -1)

                    # Compare with stored samples
                    for sample in OfficialFaceSample.objects.select_related("official"):
                        official = sample.official
                        embedding = sample.embedding

                        if embedding:
                            sample_embedding = np.array(embedding).reshape(1, -1)
                            score = cosine_similarity(frame_embedding, sample_embedding)[0][0]
                            accuracy = score * 100
                            is_match = "TRUE" if score >= self.SIMILARITY_THRESHOLD else "FALSE"
                            print(
                                f"[FACE LOGIN] Verifying {official.full_name} | "
                                f"Score: {score:.4f} | Accuracy: {accuracy:.2f}% | "
                                f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: {is_match}"
                            )
                            if score > best_score:
                                best_score = score
                                best_match = official
                                best_sample = sample
                        else:
                            # Fallback to DeepFace.verify
                            try:
                                result = DeepFace.verify(
                                    img1_path=temp_image.name,
                                    img2_path=sample.photo.path,
                                    model_name="ArcFace",
                                    enforce_detection=True
                                )
                                if result.get("verified"):
                                    score = 1.0 / (1.0 + result["distance"])
                                    if score > best_score:
                                        best_score = score
                                        best_match = official
                                        best_sample = sample
                            except Exception as ve:
                                print(f"[WARN] Fallback failed for {official.full_name}: {ve}")
                                continue

                finally:
                    if os.path.exists(temp_image.name):
                        os.remove(temp_image.name)

            # Apply similarity threshold
            if best_match and best_score >= self.SIMILARITY_THRESHOLD:
                accuracy = best_score * 100
                print(
                    f"[FACE LOGIN]  MATCH FOUND | Name: {best_match.full_name} | "
                    f"Similarity: {best_score:.4f} | Accuracy: {accuracy:.2f}% | "
                    f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: TRUE"
                )

                # ⬇️ Instead of returning tokens in body, mint tokens and set HttpOnly cookies
                refresh = RefreshToken.for_user(best_match.user)
                access = str(refresh.access_token)

                # SUCCESS → RESET failure count
                reset_ip_failures(ip)

                # Build profile photo URL (same as before)
                if getattr(best_match, "of_photo", None) and best_match.of_photo:
                    rel_url = best_match.of_photo.url
                elif best_sample and best_sample.photo:
                    rel_url = best_sample.photo.url
                else:
                    rel_url = None
                profile_photo_url = request.build_absolute_uri(rel_url) if rel_url else None

                resp = Response({
                    "match": True,
                    "official_id": best_match.of_id,
                    "name": best_match.full_name,
                    "fname": best_match.of_fname,
                    "lname": best_match.of_lname,
                    "username": best_match.user.username,
                    "role": best_match.of_role,
                    "profile_photo_url": profile_photo_url,
                    "similarity_score": float(best_score),
                    "threshold": self.SIMILARITY_THRESHOLD
                }, status=status.HTTP_200_OK)

                # Success path: reset IP fails
                reset_ip_failures(ip)

                # Log successful facial login

                LoginTracker.objects.create(
                    user=best_match.user,
                    role=best_match.of_role,
                    ip_address=ip,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    status="Success"
                )

                # 👉 Set HttpOnly cookies
                set_auth_cookies(resp, access, str(refresh))
                return resp
            
            # --- NO MATCH FOUND ---
            ip_fails = increment_ip_fail(ip)

            # Debug print
            print("FAILED ATTEMPTS (IP):", ip_fails)

            # Block IP if threshold exceeded
            if ip_fails >= MAX_FAILED_PER_IP:
                block_ip(ip)
                logger.warning(f"IP {ip} blocked due to {ip_fails} failed login attempts")

            accuracy = best_score * 100 if best_score > 0 else 0
            print(
                f"[FACE LOGIN]  NO MATCH | Best Score: {best_score:.4f} | "
                f"Accuracy: {accuracy:.2f}% | "
                f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: FALSE"
            )

            LoginTracker.objects.create(
                user=None,
                role=None,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                status="Failed"
            )

            return Response({"match": False, "message": "No matching face found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            # --- ANY ERROR COUNTS AS FAILED ATTEMPT ---
            increment_ip_fail(ip)

            # SAVE FAILURE EVENT
            LoginTracker.objects.create(
                user=None,
                role=None,
                ip_address=ip,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                status="Failed"
            )

            return Response({"match": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def detect_face(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    return len(faces) > 0

class blick_check(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
        if not uploaded_frames:
            return Response({
                "blink": False,
                "message": "No frames received. Please position your face clearly in front of the camera."
            }, status=200)

        for i, file in enumerate(uploaded_frames):
            temp_image = None
            try:
                temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                image = Image.open(file).convert("RGB")
                image.save(temp_image, format="JPEG")
                temp_image.flush()
                temp_image.close()

                with open(temp_image.name, "rb") as f:
                    image_bytes = f.read()

                # Step 1: detect face first
                if not detect_face(image_bytes):  # <-- implement detect_face function
                    os.remove(temp_image.name)
                    return Response({
                        "blink": False,
                        "message": "No face detected. Please position your face clearly in front of the camera."
                    }, status=200)

                # Step 2: detect blink
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
                if temp_image and os.path.exists(temp_image.name):
                    os.remove(temp_image.name)
                continue

        # --- NO BLINK DETECTED in any frame ---
        return Response({
            "blink": False,
            "message": "No blink detected. Please blink clearly."
        }, status=200)


# class blick_check(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#     permission_classes = [AllowAny]

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
#                     os.remove(temp_image.name) # cleanup temp
                        
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

    
#manual login ni sya para sa cookie instead of localstorage
logger = logging.getLogger(__name__)

class CookieTokenObtainPairView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'manual_login'

    @method_decorator(csrf_protect)
    def post(self, request):
        ip = get_client_ip(request)
        username = request.data.get("username", "").lower().strip()

        # immediate block checks
        if is_ip_blocked(ip):
            return Response({"detail": "Too many attempts from this IP. Try later."}, status=429)
        if username and is_user_locked(username):
            return Response({"detail": "Account temporarily locked due to failed attempts."}, status=423)

        # DRF scoped throttle check - will raise Throttled if over the configured rate
        try:
            self.check_throttles(request)
        except Throttled as t:
            logger.warning(f"Throttled login attempt from IP {ip}: {t.detail}")
            return Response({"detail": "Too many requests. Try again later."},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            # record failed login
            user_obj = User.objects.filter(username__iexact=username).first()

            # increment IP fails for all attempts
            ip_fails = increment_ip_fail(ip)

            # increment user fails only if the user exists
            user_fails = 0
            if user_obj:
                user_fails = increment_user_fail(username)

            # optional: track unknown usernames separately (analytics only)
            if not user_obj and username:
                increment_user_fail(f"anon:{username}")  # separate counter, does not lock

            # 🔍 DEBUG: print the actual counter value being stored
            print("FAILED ATTEMPTS (USER):", get_user_fails(username))
            print("FAILED ATTEMPTS (IP):", get_ip_fails(ip))

            # optional: block when threshold exceeded
            if ip_fails >= MAX_FAILED_PER_IP:
                block_ip(ip)
                logger.warning(f"IP {ip} blocked due to {ip_fails} failed login attempts")

            if user_fails >= MAX_FAILED_PER_USERNAME:
                lockout_user(username)
                logger.warning(f"User {username} locked out due to {user_fails} failed attempts")

            # log the failed attempt
            LoginTracker.objects.create(
                user=user_obj,
                role=getattr(user_obj, "official", None) and getattr(user_obj.official, "of_role", None),
                ip_address=ip,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                status="Failed"
            )

            return Response(
                {"match": False, "message": "Incorrect username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # success path
        tokens = serializer.validated_data
        user = serializer.user

        # Reset failure counters and unlock if needed
        reset_ip_failures(ip)
        reset_user_failures(user.username.lower())

        official = getattr(user, "official", None)
        role = getattr(official, "of_role", None)
        name = getattr(official, "full_name", f"{getattr(official, 'of_fname', '')} {getattr(official, 'of_lname', '')}".strip())
        official_id = getattr(official, "of_id", None)
        photo_url = request.build_absolute_uri(getattr(official, "of_photo").url) if getattr(official, "of_photo", None) else None

        resp = Response({
            "match": True,
            "official_id": official_id,
            "name": name,
            "username": user.username,
            "role": role,
            "profile_photo_url": photo_url,
        }, status=status.HTTP_200_OK)

        # Set cookies
        set_auth_cookies(resp, tokens["access"], tokens.get("refresh"))

        # Track successful login
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        LoginTracker.objects.create(
            user=user,
            role=role,
            ip_address=ip,
            user_agent=user_agent,
            status="Success"
        )

        return resp
    
    
# class CookieTokenObtainPairView(APIView):
#     permission_classes = [permissions.AllowAny]

#     @method_decorator(csrf_protect)
#     def post(self, request):
#         serializer = TokenObtainPairSerializer(data=request.data)
#         try:
#             serializer.is_valid(raise_exception=True)
#         except Exception:
#             return Response(
#                 {"match": False, "message": "Incorrect username or password."},
#                 status=status.HTTP_401_UNAUTHORIZED
#             )

#         tokens = serializer.validated_data
#         user = serializer.user

#         official = getattr(user, "official", None)
#         role = getattr(official, "of_role", None)
#         name = getattr(official, "full_name", f"{getattr(official, 'of_fname', '')} {getattr(official, 'of_lname', '')}".strip())
#         official_id = getattr(official, "of_id", None)
#         photo_url = request.build_absolute_uri(getattr(official, "of_photo").url) if getattr(official, "of_photo", None) else None

#         resp = Response({
#             "match": True,
#             "official_id": official_id,
#             "name": name,
#             "username": user.username,
#             "role": role,
#             "profile_photo_url": photo_url,
#         }, status=status.HTTP_200_OK)

#         # Set cookies
#         set_auth_cookies(resp, tokens["access"], tokens.get("refresh"))

#         #Track successful login
#         ip = get_client_ip(request)
#         user_agent = request.META.get('HTTP_USER_AGENT', '')
#         LoginTracker.objects.create(
#             user=user,
#             role=role,
#             ip_address=ip,
#             user_agent=user_agent,
#             status="Success"
#         )

#         return resp

#=================================Login Tracker=====================================
# class LoginTrackerViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = LoginTracker.objects.all().order_by('-login_time')
#     serializer_class = LoginTrackerSerializer
#     # permission_classes = [IsAuthenticated, IsRole]
#     # allowed_roles = ['DSWD']
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         user = self.request.user
#         if hasattr(user, 'official') and user.official.of_role != 'DSWD':
#             return self.queryset.filter(user=user)
#         return self.queryset  # DSWD sees all

# 4) Refresh -> read refresh from cookie; set new cookies; return 204
class CookieTokenRefreshView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(csrf_protect)
    def post(self, request):
        refresh_cookie = request.COOKIES.get("refresh")
        if not refresh_cookie:
            # No session to refresh → be quiet
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_cookie})
        serializer.is_valid(raise_exception=True)

        new_access = serializer.validated_data["access"]
        new_refresh = serializer.validated_data.get("refresh")

        resp = Response(status=status.HTTP_204_NO_CONTENT)
        set_auth_cookies(resp, new_access, new_refresh if new_refresh else None)
        return resp

# 5) Logout -> clear cookies (and optionally blacklist refresh)
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@csrf_protect
def logout(request):
    resp = Response(status=204)
    clear_auth_cookies(resp)
    return resp

#para ni sa file encryption kay diri naka store ang face_samples
class ServeOfficialFacePhotoView(APIView):
    # permission_classes = [IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]

    def get(self, request, sample_id):
        try:
            sample = OfficialFaceSample.objects.get(id=sample_id)
        except OfficialFaceSample.DoesNotExist:
            raise Http404("Official face sample not found")
        return serve_encrypted_file(request, sample, sample.photo, content_type='image/jpeg')