import tempfile, os, traceback
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
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
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.cache import cache
import uuid
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str, force_bytes
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator


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

@api_view(["GET"])
@permission_classes([AllowAny])
def check_dswd_exists(request):
    exists = Official.objects.filter(of_role="DSWD").exists()  # use your field name
    return Response({"dswd_exists": exists})



class create_official(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OfficialSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        role = serializer.validated_data.get("of_role", "").strip()
        user = None
        username = None
        generated_password = None

        # -----------------------
        # DSWD Registration Logic
        # -----------------------
        if role == "DSWD":
            if Official.objects.filter(of_role="DSWD").exists():
                return Response(
                    {"error": "A DSWD account already exists. Cannot create another automatically."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            fname = request.data.get("of_fname", "").strip().lower()
            lname = request.data.get("of_lname", "").strip().lower()
            base_username = f"{fname}{lname}".replace(" ", "")
            username = base_username or get_random_string(8)

            counter = 0
            while User.objects.filter(username=username).exists():
                counter += 1
                username = f"{base_username}{counter}"

            generated_password = get_random_string(length=12)
            user = User.objects.create_user(username=username, password=generated_password)
            status_value = "approved"

        # -----------------------
        # Social Worker
        # -----------------------
        elif role == "Social Worker":
            fname = request.data.get("of_fname", "").strip().lower()
            lname = request.data.get("of_lname", "").strip().lower()
            base_username = f"{fname}{lname}".replace(" ", "")
            username = base_username or get_random_string(8)

            counter = 0
            while User.objects.filter(username=username).exists():
                counter += 1
                username = f"{base_username}{counter}"

            generated_password = get_random_string(length=12)
            user = User.objects.create_user(username=username, password=generated_password)
            status_value = "approved"

        # -----------------------
        # VAWDesk
        # -----------------------
        elif role == "VAWDesk":
            status_value = "pending"
        else:
            return Response({"error": f"Invalid role: {role}"}, status=status.HTTP_400_BAD_REQUEST)

        # -----------------------
        # Create Official
        # -----------------------
        official = Official.objects.create(
            user=user,
            status=status_value,
            **serializer.validated_data
        )

        # -----------------------
        # Handle uploaded photos
        # -----------------------
        photo_files = request.FILES.getlist("of_photos") or []
        if not photo_files:
            single_photo = request.FILES.get("of_photo")
            if single_photo:
                photo_files = [single_photo]

        if photo_files:
            official.of_photo = photo_files[0]
            official.save()

        # -----------------------
        # Process face embeddings
        # -----------------------
        if role in ["Social Worker", "DSWD"]:
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
                return Response(
                    {"error": "Face registration failed. Please upload clearer photos."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # -----------------------
            # Send Email with credentials
            # -----------------------
            email_address = serializer.validated_data.get("of_email")  # make sure OfficialSerializer includes of_email
            if email_address:
                subject = f"Your {role} Account Credentials"
                message = (
                    f"Hello {official.of_fname} {official.of_lname},\n\n"
                    f"Your {role} account has been created and approved.\n\n"
                    f"Username: {username}\n"
                    f"Password: {generated_password}\n\n"
                    f"Please log in and change your password immediately."
                )
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email_address],
                    fail_silently=False,
                )

            return Response({
                "message": f"{role} registered. {created_count} face sample(s) saved.",
                "official_id": official.of_id,
                "username": username,
                "password": generated_password,
                "role": official.of_role,
                "photo_url": request.build_absolute_uri(official.of_photo.url) if official.of_photo else None,
                "assigned_barangay_name": official.of_assigned_barangay.name if official.of_assigned_barangay else None
            }, status=status.HTTP_201_CREATED)

        # -----------------------
        # VAWDesk: save photos only
        # -----------------------
        if role == "VAWDesk":
            for file in photo_files:
                OfficialFaceSample.objects.create(
                    official=official,
                    photo=file,
                    embedding=None
                )

            return Response({
                "message": "VAWDesk registration submitted. Awaiting DSWD approval.",
                "official_id": official.of_id,
                "role": official.of_role,
                "status": official.status
            }, status=status.HTTP_202_ACCEPTED)


class face_login(APIView):
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'face_login'
    permission_classes = [AllowAny]

    SIMILARITY_THRESHOLD = 0.65  # adjust based on testing

    def post(self, request):
        uploaded_frames = [file for name, file in request.FILES.items() if name.startswith("frame")]
        if not uploaded_frames:
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
                            # Direct list of floats
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
                            # Print verification info for each comparison
                            accuracy = score * 100
                            is_match = "TRUE" if score >= self.SIMILARITY_THRESHOLD else "FALSE"
                            print(
                                f"[FACE LOGIN] Verifying {official.full_name} | "
                                f"Score: {score:.4f} | Accuracy: {accuracy:.2f}% | "
                                f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: {is_match}")
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

            #  Apply similarity threshold
            if best_match and best_score >= self.SIMILARITY_THRESHOLD:
                accuracy = best_score * 100  # convert cosine similarity to %
                print(
                    f"[FACE LOGIN]  MATCH FOUND | Name: {best_match.full_name} | "
                    f"Similarity: {best_score:.4f} | Accuracy: {accuracy:.2f}% | "
                    f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: TRUE"
                )

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
                    "tokens": tokens,
                    "similarity_score": float(best_score),
                    "threshold": self.SIMILARITY_THRESHOLD
                }, status=200)

            accuracy = best_score * 100 if best_score > 0 else 0
            print(
                f"[FACE LOGIN]  NO MATCH | Best Score: {best_score:.4f} | "
                f"Accuracy: {accuracy:.2f}% | "
                f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: FALSE"
            )

            return Response({
                "match": False,
                "message": f"No matching face found."
            }, status=404)

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
                    os.remove(temp_image.name) # cleanup temp
                        
                    #  Return blink index + candidate indices
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
    
class ForgotPasswordFaceView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        uploaded_file = request.FILES.get("frame")
        if not uploaded_file:
            return Response({"success": False, "message": "No image uploaded."}, status=400)

        # Save temp image
        try:
            temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            temp_image.write(uploaded_file.read())
            temp_image.flush()
            temp_image.close()
            chosen_frame = temp_image.name
        except Exception as e:
            return Response({"success": False, "message": f"Failed to save image: {str(e)}"}, status=400)

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
                    print(f"[DEBUG] Compared with {official.of_fname} {official.of_lname}, "
                          f"distance: {result['distance']:.4f}, verified: {result['verified']}")

                    if result["verified"] and result["distance"] < lowest_distance:
                        lowest_distance = result["distance"]
                        best_match = official

                except Exception as ve:
                    print(f"[WARN] Skipping {sample.official.of_fname} {sample.official.of_lname}: {str(ve)}")
                    continue

            if best_match:
                return Response({
                    "success": True,
                    "official": {
                        "id": best_match.of_id,
                        "username": best_match.user.username,
                        "full_name": f"{best_match.of_fname} {best_match.of_lname}",
                    }
                }, status=200)

            return Response({"success": False, "message": "No matching account found."}, status=404)

        except Exception as e:
            traceback.print_exc()
            return Response({"success": False, "message": str(e)}, status=400)

        finally:
            if chosen_frame and os.path.exists(chosen_frame):
                os.remove(chosen_frame)


# class VerifyEmailView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         official_id = request.data.get("official_id")
#         email = request.data.get("email")

#         if not official_id or not email:
#             return Response({"success": False, "message": "Missing data"}, status=400)

#         try:
#             official = Official.objects.select_related("user").get(of_id=official_id)
#             user = official.user
#             if not user:
#                 return Response({"success": False, "message": "No linked user account"}, status=400)

#             # Check if email matches
#             if user.email != email and official.of_email != email:
#                 return Response({"success": False, "message": "Email does not match"}, status=400)

#         except Official.DoesNotExist:
#             return Response({"success": False, "message": "Official not found"}, status=404)

#         # generate reset token
#         reset_token = uuid.uuid4().hex
#         cache.set(f"reset:{reset_token}", user.id, timeout=900)  # valid 15 mins

#         return Response({
#             "success": True,
#             "reset_token": reset_token,
#             "official": {
#                 "id": official.of_id,
#                 "full_name": official.full_name,
#                 "username": user.username,
#                 "email": user.email,
#             }
#         })


# class ResetPasswordView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         token = request.data.get("reset_token")
#         new_password = request.data.get("new_password")

#         if not token or not new_password:
#             return Response({"success": False, "message": "Missing data"}, status=400)

#         user_id = cache.get(f"reset:{token}")
#         if not user_id:
#             return Response({"success": False, "message": "Invalid or expired token"}, status=400)

#         try:
#             user = User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return Response({"success": False, "message": "User not found"}, status=404)

#         user.set_password(new_password)
#         user.save()
#         cache.delete(f"reset:{token}")

#         return Response({"success": True, "message": "Password reset successful"})

# class VerifyEmailView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         official_id = request.data.get("official_id")
#         email = request.data.get("email")

#         try:
#             official = Official.objects.get(of_id=official_id)
#         except Official.DoesNotExist:
#             return Response({"error": "Official not found"}, status=status.HTTP_400_BAD_REQUEST)

#         if official.of_email != email:
#             return Response({"error": "Email does not match our records"}, status=status.HTTP_400_BAD_REQUEST)

#         user = official.user
#         if not user:
#             return Response({"error": "No linked user account"}, status=status.HTTP_400_BAD_REQUEST)

#         # Generate reset token
#         uid = urlsafe_base64_encode(force_bytes(user.pk))
#         token = default_token_generator.make_token(user)

#         # (Optional) still send an email for confirmation
#         send_mail(
#             subject="Password Reset Request",
#             message="A password reset was requested for your account. "
#                     "If this wasn’t you, please contact support immediately.",
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[email],
#         )

#         # Return uid + token for React modal flow
#         return Response({
#             "success": True,
#             "message": "Password reset instructions sent",
#             "uid": uid,
#             "reset_token": token,
#         }, status=status.HTTP_200_OK)


# class ResetPasswordView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         uidb64 = request.data.get("uid")
#         token = request.data.get("token")
#         new_password = request.data.get("new_password")

#         try:
#             uid = force_str(urlsafe_base64_decode(uidb64))
#             user = User.objects.get(pk=uid)
#         except (User.DoesNotExist, ValueError, TypeError):
#             return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

#         if not default_token_generator.check_token(user, token):
#             return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

#         user.set_password(new_password)
#         user.save()

#         return Response({"success": True, "message": "Password reset successful"}, status=status.HTTP_200_OK)
    
User = get_user_model()
token_generator = PasswordResetTokenGenerator()

# ✅ Step 2: Email Verification (works with or without face recog)
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        official_id = request.data.get("official_id")  # optional
        email = request.data.get("email") or request.data.get("of_email")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # CASE A: Face recog success → verify against official record
        if official_id:
            try:
                official = Official.objects.get(of_id=official_id)
            except Official.DoesNotExist:
                return Response({"error": "Official not found"}, status=status.HTTP_400_BAD_REQUEST)

            if official.of_email != email:
                return Response({"error": "Email does not match our records"}, status=status.HTTP_400_BAD_REQUEST)

            user = official.user
            if not user:
                return Response({"error": "No linked user account"}, status=status.HTTP_400_BAD_REQUEST)

        # CASE B: No face recog → fallback to email-only
        else:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate token + uid
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        # Always send email
        send_mail(
            subject="Password Reset Request",
            message=f"A password reset was requested for your account.\n\n"
                    f"Click the link to reset your password: {reset_link}\n\n"
                    f"If this wasn’t you, please contact support immediately.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        # Return to frontend (so React modal can also use uid+token directly if needed)
        return Response({
            "success": True,
            "message": "Password reset instructions sent",
            "uid": uid,
            "reset_token": token,
        }, status=status.HTTP_200_OK)


# ✅ Step 3: Reset Password
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not (uidb64 and token and new_password):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"success": True, "message": "Password reset successful"}, status=status.HTTP_200_OK)

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