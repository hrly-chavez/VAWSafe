from django.urls import path
from .views import *
urlpatterns = [
    path('add-user/', create_official.as_view(), name='add-user'),
    path('face-login/', face_login.as_view(), name='face-login'),
    path('manual-login/', manual_login.as_view(), name='manual-login'),
    path('blink-check/', blick_check.as_view(), name='blink-check'),
    
]