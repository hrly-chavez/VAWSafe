from django.urls import path
from .views import *

urlpatterns = [
    path('register/', VictimSignupView.as_view(), name='victim-register'),
    path('login/', VictimLoginView.as_view(), name='victim-login'),
]
