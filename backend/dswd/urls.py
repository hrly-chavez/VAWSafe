from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()

router.register(r"officials", OfficialViewSet, basename='official')
router.register(r'pending-officials', PendingOfficials, basename='pending-officials')

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
      
     # Questions library
    path("questions/", QuestionListCreate.as_view(), name="question-list-create"),
    path("questions/choices/", QuestionChoices.as_view(), name="question-choices"),
    path("questions/<int:pk>/", QuestionDetail.as_view(), name="question-detail"),
    path("questions/bulk/", QuestionBulkCreate.as_view(), name="question-bulk-create"),
    path("questions/bulk-assign/", BulkAssignView.as_view(), name="question-bulk-assign"),
    # SessionTypeQuestion mappings
    path("session-type-questions/", SessionTypeQuestionListCreate.as_view(), name="sessiontypequestion-list-create"),
    path("session-type-questions/<int:pk>/", SessionTypeQuestionDetail.as_view(), name="sessiontypequestion-detail"),
    # Session types (dropdown support)
    path("session-types/", SessionTypeList.as_view(), name="sessiontype-list"),
]