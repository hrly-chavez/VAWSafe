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

#========================================== Para ni sa Create official nga function ==============================
class AllowSetupOrAdmin(BasePermission):
    """
    Allows:
    - Anyone to create a DSWD account *if no active DSWD exists*
    - Otherwise, only logged-in DSWD users can create new officials
    """

    def has_permission(self, request, view):
        from shared_model.models import Official  # avoid circular import

        # Check if an active DSWD official exists
        dswd_exists = Official.objects.filter(
            of_role="DSWD",
            deleted_at__isnull=True
        ).exists()

        # CASE 1: No active DSWD admin → allow creation (even if anonymous)
        if not dswd_exists:
            return True

        # CASE 2: DSWD exists → only authenticated DSWD user can create new officials
        if not request.user or not request.user.is_authenticated:
            return False

        # Fetch logged in user's role
        try:
            role = request.user.official.of_role
        except Exception:
            role = None

        return role == "DSWD"
# class AllowSetupOrAdmin(BasePermission):
#     """
#     Allows:
#     - Anonymous user ONLY IF no officials exist yet (first-time system setup)
#     - Authenticated users with DSWD role afterward (admin-level)
#     """

#     def has_permission(self, request, view):
#         from shared_model.models import Official  # avoid circular import

#         there_are_existing_accounts = Official.objects.exists()

#         # CASE 1: First ever account → allow even if user is anonymous
#         if not there_are_existing_accounts:
#             return True

#         # CASE 2: After setup → only DSWD can create new accounts
#         if not request.user or not request.user.is_authenticated:
#             return False

#         # Read official role
#         try:
#             role = request.user.official.of_role
#         except Exception:
#             role = None

#         # Only DSWD users allowed
#         return role == "DSWD"