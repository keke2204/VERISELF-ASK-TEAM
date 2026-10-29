from datetime import datetime

from pydantic import BaseModel, Field


class LegalResponseCreate(BaseModel):
    finding_id: int
    evidence_id: int
    jurisdiction: str = Field(
        default="US",
        min_length=2,
        max_length=50,
    )
    rights_holder_name: str = Field(
        default="Identity Owner",
        min_length=1,
        max_length=255,
    )
    rights_holder_email: str = Field(
        default="owner@example.com",
        min_length=3,
        max_length=255,
    )


class LegalResponseStatusUpdate(BaseModel):
    status: str = Field(
        min_length=3,
        max_length=40,
    )
    submission_reference: str | None = Field(
        default=None,
        max_length=500,
    )
    resolution_notes: str | None = Field(
        default=None,
        max_length=5000,
    )


class LegalResponseResponse(BaseModel):
    id: int
    identity_id: int
    finding_id: int | None
    evidence_id: int | None
    response_type: str
    jurisdiction: str
    target_url: str
    target_domain: str | None
    recipient: str | None
    subject: str
    notice_body: str
    status: str
    submission_reference: str | None
    submitted_at: datetime | None
    resolution_notes: str | None
    created_at: datetime
    updated_at: datetime