from django.urls import path, include
from .views import *

# Account Management
from rest_framework.routers import DefaultRouter

# Account Manage
router = DefaultRouter()
router.register(r"officials", OfficialViewSet, basename="official")


urlpatterns = [
    #victim
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
    path('victims/register/', register_victim, name='register_victim'),
    #sessions
    path("sessions/", SessionListCreateView.as_view(), name="session-list-create"),
    path("sessions/<int:sess_id>/", SessionDetailView.as_view(), name="session-detail"),
    path("sessions/create_sched/", schedule_session, name="create-session"),
    # officials
    # path("approve-official/", approve_official, name="approve-official"),
    # path("reject-official/", reject_official, name="reject-official"),
    path("", include(router.urls)),
] 


