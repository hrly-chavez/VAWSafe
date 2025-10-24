#para ni sa login tracker
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver
from django.utils import timezone
from shared_model.models import LoginTracker
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    role = getattr(getattr(user, "official", None), "of_role", None)

    LoginTracker.objects.create(
        user=user,
        role=role,
        ip_address=ip,
        user_agent=user_agent,
        login_time=timezone.now(),
        status="Success"
    )

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    ip = get_client_ip(request) if request else None
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else 'Unknown'
    username = credentials.get('username', 'Unknown')

    LoginTracker.objects.create(
        user=None,
        username_attempted=username,  # ✅ Log attempted username
        role=None,
        ip_address=ip,
        user_agent=user_agent,
        status="Failed"
    )

def get_client_ip(request):
    """Utility to safely extract IP from headers."""
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
