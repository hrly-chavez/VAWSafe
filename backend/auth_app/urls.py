from django.urls import path
from .views import *
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# router.register(r'login-tracker', LoginTrackerViewSet, basename='login-tracker')

urlpatterns = [
    path('add-user/', create_official.as_view(), name='add-user'),
    path('face-login/', face_login.as_view(), name='face-login'),
    path('manual-login/', CookieTokenObtainPairView.as_view(), name='manual-login'),
    path('blink-check/', blick_check.as_view(), name='blink-check'),
    path("check-dswd/", check_dswd_exists, name="check-dswd"),
    #search face first before createuser
    #later na sa ni i comment out
    path('search-official/', SearchOfficialFacial.as_view(), name='search_official_facial'),

    #for authentication and authorization
    path('refresh/', CookieTokenRefreshView.as_view()),
    path('logout/', logout),
    path('me/', me),

    #file encryption
    path('official-face/<int:sample_id>/view/', ServeOfficialFacePhotoView.as_view(), name='serve_official_face_photo'),
] + router.urls