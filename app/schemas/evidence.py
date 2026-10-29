from datetime import datetime

from pydantic import BaseModel


class EvidenceResponse(BaseModel):
    id: int
    identity_id: int
    match_id: int | None
    finding_id: int | None
    evidence_type: str
    source_url: str
    source_domain: str | None
    content_hash: str | None
    evidence_data: dict
    captured_at: datetime
    status: str