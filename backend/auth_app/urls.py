from django.urls import path
from .views import *
urlpatterns = [
    path('add-user/', UserCreateView.as_view(), name='add-user'),
    path('face-login/', FaceLoginView.as_view(), name='face-login'),
    path('manual-login/', ManualLoginView.as_view(), name='manual-login'),
]