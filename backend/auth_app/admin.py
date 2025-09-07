from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from shared_model.models import *

User = get_user_model()

admin.site.unregister(User)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["id", "username"]
    search_fields = ["username"]

@admin.register(Official)
class OfficialAdmin(admin.ModelAdmin):
    list_display = ['of_fname', 'of_lname', 'of_role', 'user__username']
    search_fields = ['of_fname', 'of_lname']
    list_filter = ['of_role']

@admin.register(OfficialFaceSample)
class OfficialFaceSampleAdmin(admin.ModelAdmin):
    list_display = ['official', 'photo_preview', 'id']
    readonly_fields = ['embedding', 'photo_preview']
    list_filter = ['official__of_role']

    def photo_preview(self, obj):
        if obj.photo:
            return f'<img src="{obj.photo.url}" width="100" height="100" />'
        return "-"
    photo_preview.allow_tags = True
    photo_preview.short_description = "Preview"

