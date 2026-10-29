"""
VeriSelf FastAPI application entry point.
Security-hardened with:
- CORS (only trusted origins)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting (per-IP)
- Input validation via Pydantic (in schemas)
- Secrets via environment variables (never in code)
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.db.database import Base, engine
from app.models import (
    User,
    IdentityProfile,
    Scan,
    Finding,
    Alert,
    MonitoringTarget,
    MonitoringResult,
    MatchVerification,
    RiskFinding,
    EvidenceRecord,
    SecurityAlert,
    ProtectionRecord,
    LegalResponse,
)
from app.api.router import router
from app.middleware import SecurityHeadersMiddleware, RateLimitMiddleware

# Load environment variables from .env (never hardcode secrets)
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Trusted frontend origins. Keep the public GitHub Pages origin in the
# application defaults so a missing Render environment variable does not
# silently break the deployed frontend.
DEFAULT_ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://keke2204.github.io",
}
configured_origins = {
    origin.strip().rstrip("/")
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}
ALLOWED_ORIGINS = sorted(DEFAULT_ALLOWED_ORIGINS | configured_origins)

app = FastAPI(
    title="VeriSelf",
    version="0.1.0",
    description="Digital Identity Defense for the Non-Famous",
    # Hide sensitive info from public API docs in production
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    openapi_url="/openapi.json" if os.getenv("ENVIRONMENT", "development") != "production" else None,
)

# ── Middleware (order matters: outermost = last added) ──────────────────────

# 1. Rate limiting — drop abusive traffic early
app.add_middleware(RateLimitMiddleware)

# 2. Security headers — on every response
app.add_middleware(SecurityHeadersMiddleware)

# 3. CORS — only trusted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    max_age=600,  # preflight cache 10 min
)

# ── Routes ──────────────────────────────────────────────────────────────────
app.include_router(router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "VeriSelf",
        "status": "online",
        "version": "0.1.0",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Lightweight health check for uptime monitoring."""
    return {"status": "ok", "service": "VeriSelf API"}
