from django.urls import path
from .views import *


urlpatterns = [
    path("victims/", ViewVictim.as_view(), name="view_victim"),
    path("victims/<int:vic_id>/", ViewDetail.as_view(), name="view_detail"),
    path("victims/search-victim/", search_victim_facial.as_view(), name="search-face"),
]