from django.urls import path
from .views import *

urlpatterns = [
    path("victims/", victim_list.as_view(), name="victim-list"),
    path("victims/<int:vic_id>/", victim_detail.as_view(), name="victim-detail"),
    path("victims/search_face/", search_victim_facial.as_view(), name="victim-face-search"),
    path("sessions/", scheduled_session_lists.as_view(), name="my-sessions"),
    path("sessions/<int:pk>/", scheduled_session_detail.as_view(), name="session-detail"),
]
