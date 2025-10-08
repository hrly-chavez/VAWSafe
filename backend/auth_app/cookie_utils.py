from datetime import timedelta
from django.conf import settings

# In dev: samesite="Lax", secure=False. Change for prod cross-site.
COOKIE_COMMON = dict(
    samesite="Lax",
    secure=False,
    httponly=True,
)

def set_auth_cookies(response, access, refresh=None):
    # Access token cookie
    response.set_cookie(
        "access",
        access,
        max_age=int(timedelta(minutes=5).total_seconds()),  # align with your access lifetime
        path="/",
        **COOKIE_COMMON,
    )
    # Refresh token cookie
    if refresh is not None:
        response.set_cookie(
            "refresh",
            refresh,
            max_age=int(timedelta(days=7).total_seconds()),  # align with refresh lifetime
            path="/",
            **COOKIE_COMMON,
        )

def clear_auth_cookies(response):
    for name in ("access", "refresh"):
        response.delete_cookie(name, path="/")
