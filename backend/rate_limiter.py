"""
Rate limiting middleware to prevent abuse
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from config import RATE_LIMIT_PER_MINUTE, RATE_LIMIT_PER_HOUR


# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[
        f"{RATE_LIMIT_PER_MINUTE}/minute",
        f"{RATE_LIMIT_PER_HOUR}/hour"
    ],
    storage_uri="memory://"
)


def get_rate_limit_key(request: Request) -> str:
    """
    Get rate limit key from request
    Uses IP address by default
    """
    return get_remote_address(request)


# Rate limit configurations for different endpoints
RATE_LIMITS = {
    "default": f"{RATE_LIMIT_PER_MINUTE}/minute",
    "upload": "5/minute",  # Stricter for file uploads
    "convert": "10/minute",
    "compress": "10/minute",
}
