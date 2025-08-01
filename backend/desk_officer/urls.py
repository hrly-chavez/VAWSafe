from django.urls import path
from .views import get_victim_survivors, register_victim_survivor

urlpatterns = [
    path('victim_survivors/', get_victim_survivors, name='get_victim_survivors'),
    path('victim_survivors/register/', register_victim_survivor, name='register_victim_survivor'),
]
