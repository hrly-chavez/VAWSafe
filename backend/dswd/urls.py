from django.urls import path
from .views import *


urlpatterns = [
    #victim
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
    #social worker
    path("social_worker/", ViewSocialWorker.as_view(), name="view_social_worker"),
    path("social_worker/<int:of_id>/", ViewSocialWorkerDetail.as_view(), name="view_social_worker_detail"),
    #vawdesk officer
    path("vawdesk_officer/", ViewVAWDeskOfficer.as_view(), name="view_vawdesk_officer"),
]