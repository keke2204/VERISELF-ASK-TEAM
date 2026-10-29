from datetime import datetime

from pydantic import BaseModel, Field


class ProtectionResponse(BaseModel):
    protection_id: int
    identity_id: int
    original_sha256: str
    protected_sha256: str
    signature_token: str
    protection_type: str
    visible_watermark: bool
    provenance_metadata: dict
    created_at: datetime


class ProtectionVerificationResponse(BaseModel):
    valid: bool
    reason: str
    identity_id: int | None
    sha256: str


class ProtectionHistoryResponse(BaseModel):
    id: int
    identity_id: int
    original_sha256: str
    protected_sha256: str
    protection_type: str
    visible_watermark: bool
    provenance_metadata: dict
    created_at: datetime


class ProtectionOptions(BaseModel):
    identity_id: int
    visible_watermark: bool = False
    watermark_text: str = Field(
        default="Protected by VeriSelf",
        max_length=200,
    )