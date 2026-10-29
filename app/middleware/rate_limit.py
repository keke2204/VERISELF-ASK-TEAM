"""
Rate limiting middleware for VeriSelf.
Prevents brute-force attacks and API abuse.
"""

import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Per-IP request counters: {ip: [(timestamp, count)]}
_request_counts: dict[str, list] = defaultdict(list)

# Rate limit settings
RATE_LIMIT_REQUESTS = 100   # max requests
RATE_LIMIT_WINDOW = 60       # per 60 seconds

# Stricter limits for sensitive endpoints
SENSITIVE_PATHS = ["/api/identity", "/api/scan", "/api/manipulation"]
SENSITIVE_LIMIT = 20  # max 20 requests per minute for sensitive routes


def _clean_old_requests(ip: str, window: int) -> int:
    """Remove old requests outside the time window and return current count."""
    now = time.time()
    _request_counts[ip] = [
        ts for ts in _request_counts[ip] if now - ts < window
    ]
    return len(_request_counts[ip])


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter per IP address."""

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for static assets and health checks
        path = request.url.path
        if path in ("/", "/health", "/docs", "/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"

        # Determine limit based on path sensitivity
        is_sensitive = any(path.startswith(p) for p in SENSITIVE_PATHS)
        limit = SENSITIVE_LIMIT if is_sensitive else RATE_LIMIT_REQUESTS

        current_count = _clean_old_requests(client_ip, RATE_LIMIT_WINDOW)

        if current_count >= limit:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Please wait before retrying.",
                    "retry_after": RATE_LIMIT_WINDOW,
                },
                headers={"Retry-After": str(RATE_LIMIT_WINDOW)},
            )

        _request_counts[client_ip].append(time.time())
        response = await call_next(request)

        # Expose rate limit info in headers
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, limit - current_count - 1)
        )
        response.headers["X-RateLimit-Reset"] = str(
            int(time.time()) + RATE_LIMIT_WINDOW
        )
        return response
