from django.urls import path
from .views import *

urlpatterns = [
    path("victims/", victim_list.as_view(), name="victim-list"),
    path("victims/<int:vic_id>/", victim_detail.as_view(), name="victim-detail"),
    path("victims/search_face/", search_victim_facial.as_view(), name="victim-face-search"),
    path("case/<int:vic_id>/", VictimIncidentsView.as_view(), name="socialworker-view-incidents"),

    #Sessions
    path("sessions/pending&Ongoing/", scheduled_session_lists.as_view(), name="my-sessions"),
    path("sessions/<int:pk>/", scheduled_session_detail.as_view(), name="session-detail"),
    path("session-types/", SessionTypeListView.as_view(), name="session-types-list"),
    path("mapped-questions/", social_worker_mapped_questions, name="social-worker-mapped-questions"),
    path("sessions/<int:sess_id>/start/",start_session, name="social-worker-start-session"),
    path("sessions/<int:sess_id>/add-custom-question/", add_custom_question, name="add-custom-question"),
    path("sessions/<int:sess_id>/finish/", finish_session, name="social-worker-finish-session"),
    path("officials/social-workers/", list_social_workers, name="list-social-workers"),
    path("sessions/", schedule_next_session, name="social-worker-sessions"),

    #Cases
    path("cases/", SocialWorkerCaseList.as_view(), name="list-of-cases"),

]
