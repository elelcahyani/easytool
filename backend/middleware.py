"""
Security middleware for production
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'"
        )
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log all requests for security monitoring
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            response = await call_next(request)
            
            # Log response
            process_time = time.time() - start_time
            logger.info(
                f"Response: {response.status_code} "
                f"in {process_time:.2f}s"
            )
            
            return response
            
        except Exception as e:
            # Log errors
            logger.error(
                f"Error processing request: {str(e)} "
                f"from {request.client.host if request.client else 'unknown'}"
            )
            raise


class IPBlockingMiddleware(BaseHTTPMiddleware):
    """
    Block requests from blacklisted IPs
    """
    def __init__(self, app, blocked_ips: set = None):
        super().__init__(app)
        self.blocked_ips = blocked_ips or set()
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else None
        
        if client_ip in self.blocked_ips:
            logger.warning(f"Blocked request from blacklisted IP: {client_ip}")
            return Response(
                content="Access denied",
                status_code=403
            )
        
        return await call_next(request)
