from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import (
    AUTH_USER_ID,
    create_access_token,
    require_configured_auth,
    verify_credentials,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=1, max_length=500)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user_id: int


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    require_configured_auth()
    if not verify_credentials(payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token, expires_in = create_access_token(
        username=payload.username,
        user_id=AUTH_USER_ID,
    )
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=expires_in,
        user_id=AUTH_USER_ID,
    )
