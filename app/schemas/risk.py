from datetime import datetime

from pydantic import BaseModel


class RiskAssessmentResponse(BaseModel):
    finding_id: int
    identity_id: int
    match_id: int | None
    risk_score: float
    risk_level: str
    finding_type: str
    title: str
    description: str
    status: str
    created_at: datetime
    evidence: dict


class RiskSummaryResponse(BaseModel):
    identity_id: int
    total_findings: int
    critical: int
    high: int
    medium: int
    low: int
    highest_risk_score: float