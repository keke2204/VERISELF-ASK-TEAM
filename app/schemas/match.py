from datetime import datetime

from pydantic import BaseModel, Field


class MatchVerificationRequest(BaseModel):
    identity_id: int
    candidate_url: str = Field(
        min_length=8,
        max_length=2048,
    )
    authorized: bool = False


class MatchVerificationResponse(BaseModel):
    match_id: int
    identity_id: int
    candidate_url: str
    phash_distance: int | None
    phash_similarity: float | None
    face_similarity: float | None
    combined_score: float
    combined_percentage: float
    classification: str
    risk_level: str
    evidence: dict


class MatchHistoryResponse(BaseModel):
    id: int
    identity_id: int
    candidate_url: str
    phash_distance: int | None
    face_similarity: float | None
    combined_score: float
    classification: str
    risk_level: str
    created_at: datetime