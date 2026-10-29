from datetime import datetime

from pydantic import BaseModel, Field


class AlertStatusUpdate(BaseModel):
    status: str = Field(
        min_length=3,
        max_length=30,
    )


class AlertResponse(BaseModel):
    id: int
    identity_id: int
    finding_id: int
    evidence_id: int | None
    severity: str
    title: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
