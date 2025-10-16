from django.urls import path
from .views import *

urlpatterns = [
    # --- Existing endpoints ---
    path("victims/", victim_list.as_view(), name="victim-list"),
    path("victims/<int:vic_id>/", victim_detail.as_view(), name="victim-detail"),
    path("victims/search_face/", search_victim_facial.as_view(), name="victim-face-search"),
    path("case/<int:vic_id>/", VictimIncidentsView.as_view(), name="socialworker-view-incidents"),

    # Sessions
    path("sessions/pending&Ongoing/", scheduled_session_lists.as_view(), name="my-sessions"),
    path("sessions/<int:pk>/", scheduled_session_detail.as_view(), name="session-detail"),
    path("session-types/", SessionTypeListView.as_view(), name="session-types-list"),
    path("mapped-questions/", social_worker_mapped_questions, name="social-worker-mapped-questions"),
    path("sessions/<int:sess_id>/start/", start_session, name="social-worker-start-session"),
    path("sessions/<int:sess_id>/add-custom-question/", add_custom_question, name="add-custom-question"),
    path("sessions/<int:sess_id>/finish/", finish_session, name="social-worker-finish-session"),
    path("officials/social-workers/", list_social_workers, name="list-social-workers"),
    path("sessions/", schedule_next_session, name="social-worker-sessions"),
    path("cases/<int:incident_id>/close/", close_case, name="close-case"),
    #Service
    path("services/category/<int:category_id>/", services_by_category, name="services-by-category"),
    path("service-categories/", list_service_categories, name="service-categories"),
    path("services/<int:service_id>/upload/", upload_service_proof, name="upload-service-proof"),


    path("cases/", SocialWorkerCaseList.as_view(), name="list-of-cases"),
    

    # --- Availability CRUD ---
    path("availability/",OfficialAvailabilityViewSet.as_view({"get": "list", "post": "create"}),name="availability-list"),
    path("availability/<int:pk>/",OfficialAvailabilityViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),name="availability-detail"),
    path("availability/<int:pk>/reactivate/", OfficialAvailabilityViewSet.as_view({"patch": "reactivate"}), name="availability-reactivate"),
    # --- Unavailability CRUD ---
    path("unavailability/",OfficialUnavailabilityViewSet.as_view({"get": "list", "post": "create"}),name="unavailability-list"),
    path("unavailability/<int:pk>/",OfficialUnavailabilityViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),name="unavailability-detail"),

    # --- Schedule Overview ---
    path("schedule-overview/week/", OfficialScheduleOverviewViewSet.as_view({"get": "week"}),name="schedule-overview-week"),
]
