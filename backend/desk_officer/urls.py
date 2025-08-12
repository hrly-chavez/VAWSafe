from django.urls import path
from .views import *

urlpatterns = [
    path('victims/', get_victims, name='get_victims'),
    path('victims/register/', register_victim, name='register_victim'),
]
