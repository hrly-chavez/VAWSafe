# auth_app/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate using the 'access' token stored in an HttpOnly cookie.
    Keeps header-based auth working as a fallback.
    """
    def authenticate(self, request):
        # 1) Try Authorization header (normal SimpleJWT behavior)
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                return self.get_user(self.get_validated_token(raw_token)), self.get_validated_token(raw_token)

        # 2) Fallback to cookie
        raw_token = request.COOKIES.get("access")
        if raw_token is None:
            return None
        validated = self.get_validated_token(raw_token)
        return self.get_user(validated), validated
