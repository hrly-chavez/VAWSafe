from django.urls import path
from .views import *
urlpatterns = [
    path('add-user/', create_official.as_view(), name='add-user'),
    path('face-login/', face_login.as_view(), name='face-login'),
    path('manual-login/', manual_login.as_view(), name='manual-login'),
    path('blink-check/', blick_check.as_view(), name='blink-check'),
    path("check-dswd/", check_dswd_exists, name="check-dswd"),
    path("forgot-pass/", ForgotPasswordFaceView.as_view(), name="forgot-pass"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("reset-pass/", ResetPasswordView.as_view(), name="reset-pass"),
]