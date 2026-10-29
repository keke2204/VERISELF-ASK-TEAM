from datetime import datetime

from pydantic import BaseModel, Field


class MonitoringTargetCreate(BaseModel):
    user_id: int
    target_url: str = Field(
        min_length=8,
        max_length=2048,
    )


class MonitoringTargetResponse(BaseModel):
    id: int
    user_id: int
    target_url: str
    target_type: str
    status: str
    created_at: datetime


class MonitoringScanResponse(BaseModel):
    target_id: int
    success: bool
    reason: str | None
    page_url: str
    title: str | None
    candidates_found: int


class MonitoringResultResponse(BaseModel):
    id: int
    target_id: int
    page_url: str
    candidate_url: str
    candidate_type: str
    page_title: str | None
    content_hash: str | None
    discovered_at: datetime
    status: str