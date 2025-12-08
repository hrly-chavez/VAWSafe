from django.http import FileResponse, Http404
from shared_model.models import *
from rest_framework import generics, viewsets, permissions
import os, tempfile, traceback
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from deepface import DeepFace
from .serializers import *
from django.db.models import Count
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from shared_model.permissions import IsRole
from django.contrib.auth.models import User
from rest_framework.decorators import action, api_view, permission_classes
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from PIL import Image
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models.fields.files import FieldFile
from datetime import date, datetime, timedelta
from calendar import month_name
from collections import Counter
import json
from dswd.utils.logging import log_change

#change password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from cryptography.fernet import Fernet
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

def evidence_view(request, pk):
    try:
        evidence = Evidence.objects.get(pk=pk)
        return FileResponse(evidence.file.open(), content_type="image/jpeg")
    except Evidence.DoesNotExist:
        raise Http404


#===========================================Address(Used in profile)==========================================
class ProvinceList(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    # permission_classes = [IsAuthenticated, IsRole]
    # allowed_roles = ['DSWD']
    permission_classes = [AllowAny]
class MunicipalityList(generics.ListAPIView):
    serializer_class = MunicipalitySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        province_id = self.request.query_params.get("province")
        queryset = Municipality.objects.all()

        # Check if province_id is passed as an ID or a name
        if province_id:
            # Try filtering by ID first
            try:
                province_id = int(province_id)  # Try converting to an integer
                queryset = queryset.filter(province_id=province_id)
            except ValueError:
                # If it fails, assume it's a province name and filter by name
                queryset = queryset.filter(province__name=province_id)

        return queryset
    
class BarangayList(generics.ListAPIView):
    serializer_class = BarangaySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        municipality_id = self.request.query_params.get("municipality")
        queryset = Barangay.objects.all()

        # Check if municipality_id is passed as an ID or a name
        if municipality_id:
            try:
                municipality_id = int(municipality_id)  # Try converting to an integer
                queryset = queryset.filter(municipality_id=municipality_id)
            except ValueError:
                # If it fails, assume it's a municipality name and filter by name
                queryset = queryset.filter(municipality__name=municipality_id)

        return queryset

#============================================Account Management======================================
def _audit(actor, action, target, reason=None, changes=None):
    return AuditLog.objects.create(
        actor=actor,
        action=action,
        target_model=target.__class__.__name__,
        target_id=str(getattr(target, "pk", None)),
        reason=reason,
        changes=changes or {},
    )

def _audit_safe(value):
    """Return a JSON-serializable representation of common Django objects."""
    # Files / images from serializer or model
    if isinstance(value, FieldFile):
        return value.name or None  # e.g. "photos/abc.jpg"
    # InMemoryUploadedFile or any file-like with a name
    if hasattr(value, "read") and hasattr(value, "name"):
        return getattr(value, "name", "uploaded_file")

    # Model instances -> ModelLabel:pk
    if hasattr(value, "_meta") and hasattr(value, "pk"):
        try:
            return f"{value._meta.label}:{value.pk}"
        except Exception:
            return str(value)

    # Datetimes/dates
    if isinstance(value, (datetime, date)):
        return value.isoformat()

    # Containers
    if isinstance(value, dict):
        return {k: _audit_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_audit_safe(v) for v in value]

    # Primitives or fallback
    try:
        json.dumps(value)
        return value
    except TypeError:
        return str(value)

class OfficialViewSet(ModelViewSet):
    queryset = Official.objects.all()
    serializer_class = OfficialSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    allowed_roles = ["DSWD"]  # for IsRole

    def get_queryset(self):
        qs = Official.objects.filter(
            of_role__in=["Social Worker", "Nurse", "Psychometrician"]
        )

        include_archived = self.request.query_params.get("include_archived") in {"1", "true", "True"}

        # Combined actions must be allowed to see archived records
        if self.action not in {
            "retrieve",
            "archive_or_deactivate",
            "unarchive_or_reactivate",
        } and not include_archived:
            qs = qs.filter(deleted_at__isnull=True)

        return qs.order_by("of_lname", "of_fname")

    def get_permissions(self):
        # Only DSWD can modify state or update
        if self.action in {
            "archive_or_deactivate",
            "unarchive_or_reactivate",
            "partial_update",
            "update",
        }:
            return [IsAuthenticated(), IsRole()]
        return super().get_permissions()

    # ---------------------------------------------------
    #  COMBINED ACTION 1 — ARCHIVE + DEACTIVATE
    # ---------------------------------------------------
    @action(detail=True, methods=["post"])
    def archive_or_deactivate(self, request, pk=None):
        official = self.get_object()
        reason = request.data.get("reason")

        # CASE A — archive + deactivate
        if not official.deleted_at:
            official.deleted_at = timezone.now()
            official.save(update_fields=["deleted_at"])

            if official.user_id and official.user.is_active:
                official.user.is_active = False
                official.user.save(update_fields=["is_active"])

            _audit(request.user, "archive", official, reason=reason, changes={"archived_at": [None, str(official.deleted_at)]})
            return Response({
                "status": "archived_and_deactivated",
                "deleted_at": official.deleted_at
            })

        # CASE B — archived already → deactivate only
        if official.user_id and official.user.is_active:
            official.user.is_active = False
            official.user.save(update_fields=["is_active"])

            _audit(request.user, "deactivate", official, reason=reason, changes={"archived_at": [None, str(official.deleted_at)]})
            return Response({"status": "deactivated"})

        return Response({"detail": "Already archived & deactivated."}, status=400)

    # ---------------------------------------------------
    #  COMBINED ACTION 2 — UNARCHIVE + REACTIVATE
    # ---------------------------------------------------
    @action(detail=True, methods=["post"])
    def unarchive_or_reactivate(self, request, pk=None):
        official = self.get_object()
        reason = request.data.get("reason")

        # CASE A — unarchive + reactivate
        if official.deleted_at:
            before = official.deleted_at
            official.deleted_at = None
            official.save(update_fields=["deleted_at"])

            if official.user_id and not official.user.is_active:
                official.user.is_active = True
                official.user.save(update_fields=["is_active"])

            _audit(
                request.user,
                "unarchive",
                official,
                reason=reason,
                changes={"deleted_at": [str(before), None]},
            )
            return Response({"status": "unarchived_and_reactivated"})

        # CASE B — reactivate only
        if official.user_id and not official.user.is_active:
            official.user.is_active = True
            official.user.save(update_fields=["is_active"])

            _audit(request.user, "reactivate", official, reason=reason)
            return Response({"status": "reactivated"})

        return Response({"detail": "Already active and not archived."}, status=400)

    # ---------------------------------------------------
    #  AUDITS LIST
    # ---------------------------------------------------
    @action(detail=True, methods=["get"])
    def audits(self, request, pk=None):
        qs = AuditLog.objects.filter(
            target_model="Official",
            target_id=str(pk)
        ).order_by("-created_at")[:50]

        return Response(AuditLogSerializer(qs, many=True).data)

#==========================================Change Password (admin side)==============================
class ChangePasswordFaceView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']
    SIMILARITY_THRESHOLD = 0.65  # same as face_login

    def decrypt_temp_file(self, encrypted_path):
        """Decrypt .enc image into a temporary .jpg file."""
        fernet = Fernet(settings.FERNET_KEY)
        with open(encrypted_path, "rb") as enc_file:
            encrypted_data = enc_file.read()
        decrypted_data = fernet.decrypt(encrypted_data)

        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        temp.write(decrypted_data)
        temp.flush()
        temp.close()
        return temp.name

    def post(self, request):
        uploaded_file = request.FILES.get("frame")
        if not uploaded_file:
            return Response({"success": False, "message": "No image uploaded."}, status=400)

        # Save webcam frame temporarily
        try:
            temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            image = Image.open(uploaded_file).convert("RGB")
            image.save(temp_image, format="JPEG")
            temp_image.flush()
            temp_image.close()
            chosen_frame = temp_image.name
        except Exception as e:
            return Response({"success": False, "message": f"Failed to save image: {str(e)}"}, status=400)

        best_match = None
        best_sample = None
        best_score = -1.0
        decrypted_temp_files = []

        try:
            # Generate embedding for uploaded frame
            embeddings = DeepFace.represent(
                img_path=chosen_frame,
                model_name="ArcFace",
                enforce_detection=True
            )

            # Handle DeepFace return formats
            frame_embedding = None
            if isinstance(embeddings, list):
                if len(embeddings) > 0 and isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
                    frame_embedding = embeddings[0]["embedding"]
                elif all(isinstance(x, (int, float)) for x in embeddings):
                    frame_embedding = embeddings
            elif isinstance(embeddings, dict) and "embedding" in embeddings:
                frame_embedding = embeddings["embedding"]

            if frame_embedding is None:
                return Response({"success": False, "message": "Could not extract face embedding."}, status=400)

            frame_embedding = np.array(frame_embedding).reshape(1, -1)

            # Compare with stored embeddings
            for sample in OfficialFaceSample.objects.select_related("official"):
                official = sample.official
                embedding = sample.embedding

                try:
                    if embedding:
                        # Compare embeddings directly
                        sample_embedding = np.array(embedding).reshape(1, -1)
                        score = cosine_similarity(frame_embedding, sample_embedding)[0][0]
                        accuracy = score * 100
                        is_match = score >= self.SIMILARITY_THRESHOLD
                        print(
                            f"[FORGOT-PASS] Comparing with {official.full_name} | "
                            f"Score: {score:.4f} | Accuracy: {accuracy:.2f}% | "
                            f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: {is_match}"
                        )
                        if score > best_score:
                            best_score = score
                            best_match = official
                            best_sample = sample
                    else:
                        # Fallback to encrypted image comparison
                        photo_path = sample.photo.path
                        if photo_path.lower().endswith(".enc"):
                            photo_path = self.decrypt_temp_file(photo_path)
                            decrypted_temp_files.append(photo_path)

                        result = DeepFace.verify(
                            img1_path=chosen_frame,
                            img2_path=photo_path,
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
                    print(f"[WARN] Skipping {official.full_name}: {str(ve)}")
                    continue

            # Evaluate result
            if best_match and best_score >= self.SIMILARITY_THRESHOLD:
                accuracy = best_score * 100
                print(
                    f"[FORGOT-PASS] MATCH FOUND | Name: {best_match.full_name} | "
                    f"Similarity: {best_score:.4f} | Accuracy: {accuracy:.2f}% | "
                    f"Threshold: {self.SIMILARITY_THRESHOLD} | Result: TRUE"
                )
                return Response({
                    "success": True,
                    "official": {
                        "id": best_match.of_id,
                        "username": best_match.user.username,
                        "full_name": best_match.full_name,
                    },
                    "similarity_score": float(best_score),
                    "threshold": self.SIMILARITY_THRESHOLD,
                }, status=200)

            accuracy = best_score * 100 if best_score > 0 else 0
            print(
                f"[FORGOT-PASS] NO MATCH | Best Score: {best_score:.4f} | "
                f"Accuracy: {accuracy:.2f}% | Threshold: {self.SIMILARITY_THRESHOLD}"
            )
            return Response({"success": False, "message": "No matching account found."}, status=404)

        except Exception as e:
            traceback.print_exc()
            return Response({"success": False, "message": str(e)}, status=400)

        finally:
            # Clean up all temp files
            if os.path.exists(chosen_frame):
                os.remove(chosen_frame)
            for f in decrypted_temp_files:
                if os.path.exists(f):
                    os.remove(f)

    
User = get_user_model()
token_generator = PasswordResetTokenGenerator()

# ✅ Step 2: Email Verification (works with or without face recog)
class VerifyEmailView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

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
    
def custom_password_rules(password):
    errors = []

    if len(password) < 16:
        errors.append("Password must be at least 16 characters long.")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter.")
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter.")
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number.")
    if not any(c in "!@#$%^&*(),.?\":{}|<>" for c in password):
        errors.append("Password must contain at least one special character.")

    return errors



# ✅ Step 3: Reset Password
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not (uidb64 and token and new_password):
            return Response({"error": "Missing required fields"}, status=status.HTTP_200_OK)

        # Decode user
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except:
            return Response({"error": "Invalid link"}, status=status.HTTP_200_OK)

        # Token check
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_200_OK)

        # ----- CUSTOM PASSWORD RULES -----
        custom_errors = custom_password_rules(new_password)
        if custom_errors:
            return Response({"error": custom_errors}, status=status.HTTP_200_OK)
        # ----------------------------------

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": e.messages}, status=status.HTTP_200_OK)

        # Set new password
        user.set_password(new_password)
        user.save()

        # AUDIT LOG...
        official = getattr(user, "official", None)

        changes = {"password": ["<old password>", "<new password>"]}

        _audit(
            actor=user,
            action="change pass",
            target=official if official else user,
            reason="Password reset via email link",
            changes=_audit_safe(changes),
        )

        return Response({"success": True, "message": "Password reset successful"})

# ============================= Dashboard =======================================
class DSWDDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ['DSWD']

    def get(self, request):
        today = date.today()

        # ---------------- Victim Summary ----------------
        victims_all = Victim.objects.all()
        victims = [v for v in victims_all if getattr(v, "vic_sex", None) == "Female"]

        total_female_victims = len(victims)

        # Age group counters
        age_0_18, age_18_35, age_36_50, age_51_plus = 0, 0, 0, 0

        for v in victims:
            birth = getattr(v, "vic_birth_date", None)
            if birth:
                age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
                if age < 18:
                    age_0_18 += 1
                elif 18 <= age <= 35:
                    age_18_35 += 1
                elif 36 <= age <= 50:
                    age_36_50 += 1
                elif age >= 51:
                    age_51_plus += 1

        # Percentages
        age_0_18_percent = round((age_0_18 / total_female_victims) * 100, 1) if total_female_victims > 0 else 0
        age_18_35_percent = round((age_18_35 / total_female_victims) * 100, 1) if total_female_victims > 0 else 0
        age_36_50_percent = round((age_36_50 / total_female_victims) * 100, 1) if total_female_victims > 0 else 0
        age_51_plus_percent = round((age_51_plus / total_female_victims) * 100, 1) if total_female_victims > 0 else 0

        victim_summary = {
            "total_female_victims": total_female_victims,
            "age_0_18": age_0_18,
            "age_18_35": age_18_35,
            "age_36_50": age_36_50,
            "age_51_plus": age_51_plus,
            "age_0_18_percent": age_0_18_percent,   
            "age_18_35_percent": age_18_35_percent,
            "age_36_50_percent": age_36_50_percent,
            "age_51_plus_percent": age_51_plus_percent,
        }

        # ---------------- Incident Summary ----------------
        incidents = IncidentInformation.objects.all()
        total_cases = incidents.count()

        active_cases = sum(1 for i in incidents if getattr(i, "incident_status", None) in ["Pending", "Ongoing"])
        resolved_cases = sum(1 for i in incidents if getattr(i, "incident_status", None) == "Done")

        LIMIT_ACTIVE = 100
        LIMIT_RESOLVED = 100

        active_percent = round((active_cases / LIMIT_ACTIVE) * 100, 1) if LIMIT_ACTIVE > 0 else 0
        resolved_percent = round((resolved_cases / LIMIT_RESOLVED) * 100, 1) if LIMIT_RESOLVED > 0 else 0

        violence_types = Counter(
            getattr(i, "violence_type", None)
            for i in incidents if getattr(i, "violence_type", None)
        )
        violence_types_dict = dict(violence_types)

        total_violence = sum(violence_types.values())
        top_type, top_percent = "N/A", 0.0
        if total_violence > 0:
            top_key, top_count = violence_types.most_common(1)[0]
            top_type = top_key
            top_percent = round((top_count / total_violence) * 100, 1)

        status_counts = incidents.values("incident_status").annotate(count=Count("incident_status"))
        status_types = {s["incident_status"]: s["count"] for s in status_counts}

        incident_summary = {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "active_percent": active_percent,
            "resolved_cases": resolved_cases,
            "resolved_percent": resolved_percent,
            "violence_types": violence_types_dict,
            "status_types": status_types,
            "top_violence_type": top_type,
            "top_violence_percent": top_percent,
        }

        # ---------------- Monthly Report Rows ----------------
        report_rows = []
        for i in range(1, 13):
            month_incidents = [
                inc for inc in incidents
                if getattr(inc, "incident_date", None)
                and inc.incident_date.month == i
                # instead of only today.year, allow multiple years
                and inc.incident_date.year in [2025, 2026]
            ]
            report_rows.append({
                "month": month_name[i],
                "year": today.year,  
                "totalVictims": len(month_incidents),
                "Physical Violence": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Physical Violence"),
                "Physical Abused": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Physical Abused"),
                "Psychological Violence": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Psychological Violence"),
                "Psychological Abuse": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Psychological Abuse"),
                "Economic Abused": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Economic Abused"),
                "Strandee": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Strandee"),
                "Sexually Abused": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Sexually Abused"),
                "Sexually Exploited": sum(1 for inc in month_incidents if getattr(inc, "violence_type", None) == "Sexually Exploited"),
                "referredDSWD": 0,
                "referredHospital": 0,
            })

        return Response({
            "victim_summary": FemaleVictimSummarySerializer(victim_summary).data,
            "incident_summary": IncidentSummarySerializer(incident_summary).data,
            "monthly_report_rows": MonthlyReportRowSerializer(report_rows, many=True).data,
        })
    
#===========================================Profile==========================================
def _diff(instance, new_data):
    changes = {}
    for field, new_value in new_data.items():
        old_value = getattr(instance, field, None)
        if old_value != new_value:
            changes[field] = [str(old_value), str(new_value)]
    return changes


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        user = self.request.user
        try:
            return user.official
        except Official.DoesNotExist:
            raise Response({"message": "Profile not found for the logged-in user."}, status=404)

    def retrieve(self, request, *args, **kwargs):
        official = self.get_object()
        serializer = OfficialSerializer(official)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        official = self.get_object()
        data = request.data.copy()

        # ---- Track old data ----
        old_instance = Official.objects.get(pk=official.pk)

        # ---- Normalize address flag ----
        is_address_updated = data.get("isAddressUpdated", False)
        if isinstance(is_address_updated, str):
            is_address_updated = is_address_updated.lower() == "true"

        # ---- Handle photo ----
        if "of_photo" in request.FILES:
            official.of_photo = request.FILES["of_photo"]

        # ---- Handle address ----
        new_address = data.get("address")
        if isinstance(new_address, str):
            try:
                new_address = json.loads(new_address)
            except json.JSONDecodeError:
                new_address = None

        if is_address_updated and new_address:
            # Prevent overwriting names accidentally
            for field in ["of_fname", "of_lname"]:
                data.pop(field, None)

            # Validate fields
            missing_fields = [f.capitalize() for f in ["province", "municipality", "barangay", "sitio", "street"] if not new_address.get(f)]
            if missing_fields:
                return Response({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)

            # Delete old address if it exists
            try:
                if official.address:
                    official.address.delete()
            except Address.DoesNotExist:
                pass  # safe if no address exists

            # Create new address
            try:
                province = Province.objects.get(id=new_address.get("province"))
                municipality = Municipality.objects.get(id=new_address.get("municipality"))
                barangay = Barangay.objects.get(id=new_address.get("barangay"))
            except (Province.DoesNotExist, Municipality.DoesNotExist, Barangay.DoesNotExist):
                return Response({"error": "Invalid address IDs provided."}, status=400)

            official.address = Address.objects.create(
                province=province,
                municipality=municipality,
                barangay=barangay,
                sitio=new_address.get("sitio"),
                street=new_address.get("street"),
            )

        # ---- Save main changes ----
        serializer = OfficialSerializer(official, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # ---- Detect changes ----
        changes = _diff(old_instance, serializer.validated_data)

        # ---- Address logging ----
        if is_address_updated:
            try:
                old_addr_str = str(old_instance.address)
            except Address.DoesNotExist:
                old_addr_str = "None"

            new_addr_str = str(official.address) if official.address else "None"
            changes["address"] = [old_addr_str, new_addr_str]

        # ---- Photo logging ----
        if "of_photo" in request.FILES:
            changes["of_photo"] = ["<old photo>", "<new uploaded photo>"]

        # ---- Write audit log ----
        if changes:
            _audit(
                actor=request.user,
                action="update",
                target=official,
                reason=request.data.get("reason", "Profile update"),
                changes=_audit_safe(changes),
            )

        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def audits(self, request, pk=None):
        qs = AuditLog.objects.filter(
            target_model="Official",
            target_id=str(pk)
        ).order_by("-created_at")[:50]
        return Response(AuditLogSerializer(qs, many=True).data)

    
#==========================================Change Password (user side)==============================
User = get_user_model()

class UpdateUsernamePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        official = getattr(user, "official", None)  # For audit logging

        new_username = request.data.get("username")
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Basic validation
        if not all([new_username, current_password, new_password, confirm_password]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New password and confirmation do not match"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        # Track old values for audit purposes
        changes = {}

        # Username change
        if new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            
            changes["username"] = [user.username, new_username]
            user.username = new_username

        # Password change
        changes["password"] = ["<old password>", "<new password>"]  # Do NOT log plaintext

        # Apply updates
        user.set_password(new_password)
        user.save()

        # ---- Write Audit Log ----
        _audit(
            actor=request.user,
            action="change pass",
            target=official if official else user,
            reason="User updated username and/or password",
            changes=_audit_safe(changes),
        )

        return Response({"success": True, "message": "Username and password updated successfully"})

    
#========================================== Login Tracker ==============================
class LoginTrackerListAPIView(APIView):
    """
    Admin-only endpoint to view login tracker logs
    """
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["DSWD"]  # only DSWD/admin can view

    def get(self, request):
        logs = LoginTracker.objects.order_by("-login_time")[:200]  # last 200 logs
        serializer = LoginTrackerSerializer(logs, many=True)
        return Response(serializer.data)

class LoginTrackerCleanupAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ["DSWD"]

    def delete(self, request):
        threshold = timezone.now() - timedelta(days=14)
        deleted_count, _ = LoginTracker.objects.filter(
            login_time__lt=threshold
        ).delete()

        return Response({"deleted": deleted_count})
