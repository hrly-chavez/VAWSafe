from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()

router.register(r"officials", OfficialViewSet, basename='official')
# router.register(r'pending-officials', PendingOfficials, basename='pending-officials')
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    #victim
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("victims/case/<int:vic_id>/", VictimIncidentsView.as_view(), name="view_incidents"),
    #part gihapon sa victim pero view sessions sa victim
    path("victims/sessions/<int:sess_id>/", SessionDetailView.as_view(), name="session-detail"),
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
    #address
    path("provinces/", ProvinceList.as_view(), name="province"),
    path("municipalities/", MunicipalityList.as_view(), name="municipality"),
    path("barangays/", BarangayList.as_view(), name="barangay"),
    #social worker
    # path("social_worker/", ViewSocialWorker.as_view(), name="view_social_worker"),
    # path("social_worker/<int:of_id>/", ViewSocialWorkerDetail.as_view(), name="view_social_worker_detail"),
    # #vawdesk officer
    # path("vawdesk_officer/", ViewVAWDeskOfficer.as_view(), name="view_vawdesk_officer"),
    # path("vawdesk_officer/<int:of_id>/", ViewVAWDeskOfficerDetail.as_view(), name="view_vawdesk_officer_detail"),
      
  #Questions library==================
    path("questions/", QuestionListCreate.as_view(), name="question-list-create"),
    path("questions/choices/", QuestionChoices.as_view(), name="question-choices"),
    path("questions/<int:pk>/", QuestionDetail.as_view(), name="question-detail"),
    path("questions/bulk/", QuestionBulkCreate.as_view(), name="question-bulk-create"),
    path("questions/bulk-assign/", BulkAssignView.as_view(), name="question-bulk-assign"),
    # SessionTypeQuestion mappings
    path("session-type-questions/", SessionTypeQuestionListCreate.as_view(), name="sessiontypequestion-list-create"),
    path("session-type-questions/<int:pk>/", SessionTypeQuestionDetail.as_view(), name="sessiontypequestion-detail"),
    # Session types
    path("session-types/", SessionTypeList.as_view(), name="sessiontype-list"),

    path("change-logs/", ChangeLogListView.as_view(), name="change-log-list"),

  #======================

    #services
    path("services/", ServicesListCreateView.as_view(), name="services-list-create"),
    path("service-categories/", ServiceCategoryListView.as_view(), name="service-categories"),
    path("services/<int:pk>/", ServicesDetailView.as_view(), name="dswd-service-detail"),

    #change password (admin)
    path("change-pass/", ChangePasswordFaceView.as_view(), name="change-pass"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("reset-pass/", ResetPasswordView.as_view(), name="reset-pass"),

    #change password (user)
    path('update-username-password/', UpdateUsernamePasswordView.as_view(), name='change-password-logged-in'),

    #reports
    path("dswddashboard/summary/", DSWDDashboardAPIView.as_view(), name="dswd-dashboard-summary"),

    path('', include(router.urls)),
]# + router.urls
