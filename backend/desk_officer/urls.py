from django.urls import path
from .views import *


urlpatterns = [
    #victim
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
    path('victims/register/', register_victim, name='register_victim'),
    #sessions
    path("sessions/create_sched/", schedule_session, name="create-session"),
] 
