from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()

router.register(r"officials", OfficialViewSet, basename='official')
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    #evidence
    path("api/evidence/<int:pk>/view/", evidence_view, name="evidence_view"),
    #address gamit sa profile
    path("provinces/", ProvinceList.as_view(), name="province"),
    path("municipalities/", MunicipalityList.as_view(), name="municipality"),
    path("barangays/", BarangayList.as_view(), name="barangay"),

    #change password (admin)
    path("change-pass/", ChangePasswordFaceView.as_view(), name="change-pass"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("reset-pass/", ResetPasswordView.as_view(), name="reset-pass"),
    #change password (user)
    path('update-username-password/', UpdateUsernamePasswordView.as_view(), name='change-password-logged-in'),

    #reports
    path("dswddashboard/summary/", DSWDDashboardAPIView.as_view(), name="dswd-dashboard-summary"),

    #login tracker
    path("login-tracker/", LoginTrackerListAPIView.as_view(), name="login-tracker"),
    path("login-tracker/cleanup/", LoginTrackerCleanupAPIView.as_view()),


    path('', include(router.urls)),
]
