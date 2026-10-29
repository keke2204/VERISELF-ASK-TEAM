"""JWT authentication helpers for the VeriSelf API."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
CONFIGURED_JWT_SECRET = os.getenv("JWT_SECRET")
JWT_SECRET = CONFIGURED_JWT_SECRET or secrets.token_urlsafe(32)
AUTH_USER_ID = int(os.getenv("AUTH_USER_ID", "1"))
AUTH_USERNAME = os.getenv("AUTH_USERNAME", "demo")
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD", "")

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(*, username: str, user_id: int = AUTH_USER_ID) -> tuple[str, int]:
    expires_in = JWT_EXPIRES_MINUTES * 60
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "user_id": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRES_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM), expires_in


def verify_credentials(username: str, password: str) -> bool:
    """Verify the single configured application owner account.

    Credentials are deliberately supplied through Render environment variables;
    no password is stored in the repository.
    """
    return bool(AUTH_PASSWORD) and secrets.compare_digest(username, AUTH_USERNAME) and secrets.compare_digest(password, AUTH_PASSWORD)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A Bearer access token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The access token is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if payload.get("type") != "access" or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The access token is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def require_configured_auth() -> None:
    if os.getenv("ENVIRONMENT", "development").lower() == "production" and not CONFIGURED_JWT_SECRET:
        raise HTTPException(status_code=503, detail="JWT_SECRET is not configured.")
    if not AUTH_PASSWORD:
        raise HTTPException(status_code=503, detail="AUTH_PASSWORD is not configured.")
