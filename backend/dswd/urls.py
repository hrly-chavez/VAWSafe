from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()

router.register(r"officials", OfficialViewSet, basename='official')
urlpatterns = [
    #victim
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
    path("provinces/", ProvinceList.as_view(), name="province"),
    path("municipalities/", MunicipalityList.as_view(), name="municipality"),
    path("barangays/", BarangayList.as_view(), name="barangay"),
    #social worker
    path("social_worker/", ViewSocialWorker.as_view(), name="view_social_worker"),
    path("social_worker/<int:of_id>/", ViewSocialWorkerDetail.as_view(), name="view_social_worker_detail"),
    #vawdesk officer
    path("vawdesk_officer/", ViewVAWDeskOfficer.as_view(), name="view_vawdesk_officer"),
    path("vawdesk_officer/<int:of_id>/", ViewVAWDeskOfficerDetail.as_view(), name="view_vawdesk_officer_detail"),
] + router.urls
