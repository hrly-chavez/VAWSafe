# auth_app/login_protection.py
from django.core.cache import cache
from datetime import timedelta

# configuration
MAX_FAILED_PER_IP = 10        # fail attempts allowed before blocking IP
MAX_FAILED_PER_USERNAME = 5   # fail attempts per username before lockout
LOCKOUT_TIME = 60 * 15        # 15 minutes lockout
IP_BLOCK_TIME = 60 * 30       # 30 minutes for IP block

def _ip_key(ip):
    return f"login:fail:ip:{ip}"

def _user_key(username):
    return f"login:fail:user:{username}"

def increment_ip_fail(ip):
    k = _ip_key(ip)
    val = cache.get(k, 0) + 1
    cache.set(k, val, timeout=IP_BLOCK_TIME)
    return val

def increment_user_fail(username):
    k = _user_key(username)
    val = cache.get(k, 0) + 1
    cache.set(k, val, timeout=LOCKOUT_TIME)
    return val

def get_ip_fails(ip):
    return cache.get(_ip_key(ip), 0)

def get_user_fails(username):
    return cache.get(_user_key(username), 0)

def block_ip(ip):
    cache.set(f"login:block:ip:{ip}", True, timeout=IP_BLOCK_TIME)

def is_ip_blocked(ip):
    return cache.get(f"login:block:ip:{ip}", False)

def lockout_user(username):
    cache.set(f"login:lock:user:{username}", True, timeout=LOCKOUT_TIME)

def is_user_locked(username):
    return cache.get(f"login:lock:user:{username}", False)

def reset_user_failures(username):
    cache.delete(_user_key(username))

def reset_ip_failures(ip):
    cache.delete(_ip_key(ip))
