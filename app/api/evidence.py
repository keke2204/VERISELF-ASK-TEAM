from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.evidence import EvidenceRecord
from app.schemas.evidence import EvidenceResponse


router = APIRouter(
    prefix="/evidence",
    tags=["Alerts & Evidence"],
)


@router.get(
    "/{identity_id}",
    response_model=list[EvidenceResponse],
)
def get_evidence(
    identity_id: int,
    db: Session = Depends(get_db),
):
    records = (
        db.query(EvidenceRecord)
        .filter(
            EvidenceRecord.identity_id
            == identity_id
        )
        .order_by(
            EvidenceRecord.id.desc()
        )
        .all()
    )

    response = []

    for record in records:
        try:
            evidence_data = json.loads(
                record.evidence_data
            )
        except (
            TypeError,
            json.JSONDecodeError,
        ):
            evidence_data = {
                "raw_evidence":
                    record.evidence_data
            }

        response.append(
            EvidenceResponse(
                id=record.id,
                identity_id=record.identity_id,
                match_id=record.match_id,
                finding_id=record.finding_id,
                evidence_type=record.evidence_type,
                source_url=record.source_url,
                source_domain=record.source_domain,
                content_hash=record.content_hash,
                evidence_data=evidence_data,
                captured_at=record.captured_at,
                status=record.status,
            )
        )

    return response