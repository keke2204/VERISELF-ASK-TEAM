import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.evidence import EvidenceRecord
from app.models.legal_response import LegalResponse
from app.models.risk import RiskFinding
from app.schemas.legal_response import (
    LegalResponseCreate,
    LegalResponseResponse,
    LegalResponseStatusUpdate,
)
from app.services.legal_response_service import (
    generate_takedown_notice,
    update_legal_response_status,
)


router = APIRouter(
    tags=["Legal Response & Takedown"],
)


@router.post(
    "/legal/takedown",
    response_model=LegalResponseResponse,
)
@router.post(
    "/legal-response/takedown",
    response_model=LegalResponseResponse,
)
def create_takedown_notice(
    payload: LegalResponseCreate,
    db: Session = Depends(get_db),
):
    finding = (
        db.query(RiskFinding)
        .filter(
            RiskFinding.id == payload.finding_id
        )
        .first()
    )

    if finding is None:
        raise HTTPException(
            status_code=404,
            detail="Risk finding not found.",
        )

    evidence = (
        db.query(EvidenceRecord)
        .filter(
            EvidenceRecord.id == payload.evidence_id
        )
        .first()
    )

    if evidence is None:
        raise HTTPException(
            status_code=404,
            detail="Evidence record not found.",
        )

    if finding.identity_id != evidence.identity_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Finding and evidence belong "
                "to different identities."
            ),
        )

    try:
        return generate_takedown_notice(
            db=db,
            finding=finding,
            evidence=evidence,
            jurisdiction=payload.jurisdiction,
            rights_holder_name=(
                payload.rights_holder_name
            ),
            rights_holder_email=(
                payload.rights_holder_email
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@router.get(
    "/legal-response/{identity_id}",
    response_model=list[LegalResponseResponse],
)
@router.get(
    "/legal/responses/{identity_id}",
    response_model=list[LegalResponseResponse],
)
def get_legal_responses(
    identity_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(LegalResponse)
        .filter(
            LegalResponse.identity_id == identity_id
        )
        .order_by(
            LegalResponse.id.desc()
        )
        .all()
    )


@router.post(
    "/legal-response/generate/{finding_id}",
    response_model=LegalResponseResponse,
)
@router.post(
    "/legal/generate/{finding_id}",
    response_model=LegalResponseResponse,
)
def generate_notice_for_finding(
    finding_id: int,
    db: Session = Depends(get_db),
):
    finding = (
        db.query(RiskFinding)
        .filter(RiskFinding.id == finding_id)
        .first()
    )

    if finding is None:
        raise HTTPException(
            status_code=404,
            detail="Risk finding not found.",
        )

    evidence = (
        db.query(EvidenceRecord)
        .filter(EvidenceRecord.finding_id == finding.id)
        .first()
    )

    if evidence is None:
        evidence = (
            db.query(EvidenceRecord)
            .filter(
                EvidenceRecord.identity_id
                == finding.identity_id
            )
            .order_by(EvidenceRecord.id.desc())
            .first()
        )

    if evidence is None:
        evidence = EvidenceRecord(
            identity_id=finding.identity_id,
            source_url="https://monitored-source.example/incident",
            source_domain="monitored-source.example",
            evidence_data=json.dumps({
                "finding_id": finding.id,
                "title": finding.title,
                "risk_score": finding.risk_score,
            }),
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)

    try:
        return generate_takedown_notice(
            db=db,
            finding=finding,
            evidence=evidence,
            jurisdiction="US",
            rights_holder_name="Identity Owner",
            rights_holder_email="owner@example.com",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@router.patch(
    "/legal/responses/{response_id}/status",
    response_model=LegalResponseResponse,
)
@router.patch(
    "/legal-response/{response_id}/status",
    response_model=LegalResponseResponse,
)
def update_response_status(
    response_id: int,
    payload: LegalResponseStatusUpdate,
    db: Session = Depends(get_db),
):
    try:
        return update_legal_response_status(
            db=db,
            response_id=response_id,
            status=payload.status,
            submission_reference=(
                payload.submission_reference
            ),
            resolution_notes=(
                payload.resolution_notes
            ),
        )

    except ValueError as exc:
        message = str(exc)

        status_code = (
            422
            if message == "Invalid legal response status."
            else 404
        )

        raise HTTPException(
            status_code=status_code,
            detail=message,
        ) from exc