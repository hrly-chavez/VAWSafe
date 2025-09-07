# shared_model/permissions.py
from rest_framework.permissions import BasePermission

class IsRole(BasePermission):
    """
    Usage: permission_classes = [IsAuthenticated, IsRole]
    Set view attribute allowed_roles = ['DSWD']
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        allowed = getattr(view, "allowed_roles", None)
        # if no allowed_roles defined, only requires authentication
        if not allowed:
            return True
        try:
            role = request.user.official.of_role
        except Exception:
            role = None
        return role in allowed
