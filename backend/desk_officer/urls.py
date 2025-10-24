from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from . import views

router = DefaultRouter()
router.register(r"provinces", ProvinceViewSet)
router.register(r"municipalities", MunicipalityViewSet)


router.register(r"officials", OfficialViewSet, basename='official')

urlpatterns = [
    #victim
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("case/<int:vic_id>/", VictimIncidentsView.as_view(), name="view-incidents"), # cases
    
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
    path('victims/register/', register_victim, name='register_victim'),
    
    #sessions
    path("sessions/", SessionListCreateView.as_view(), name="session-list-create"),
    path("sessions/<int:sess_id>/", SessionDetailView.as_view(), name="session-detail"),
    path("sessions/create_sched/", create_session, name="create-session"),
    path("officials/social-workers/", list_social_workers, name="list-social-workers"),
    path("session-types/", list_session_types, name="list-session-types"),
    path("mapped-questions/", mapped_questions, name="mapped-questions"),
    path("sessions/<int:sess_id>/questions/", session_questions, name="session-questions"),
    path("sessions/<int:sess_id>/start/", start_session, name="start-session"),
    path("sessions/<int:sess_id>/finish/", finish_session, name="finish-session"),

    #file encryption
    path('evidence/<int:evidence_id>/download/', ServeEvidenceFileView.as_view(), name='serve_evidence_file'),
    path('victim-face/<int:sample_id>/view/', ServeVictimFacePhotoView.as_view(), name='serve_victim_face_photo'),

] + router.urls
