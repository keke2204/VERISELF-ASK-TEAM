from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.match import MatchVerification
from app.models.risk import RiskFinding
from app.schemas.risk import (
    RiskAssessmentResponse,
    RiskSummaryResponse,
)
from app.services.risk_service import create_risk_finding


router = APIRouter(
    prefix="/risk",
    tags=["Risk Scoring & Findings"],
)


@router.post(
    "/assess/{match_id}",
    response_model=RiskAssessmentResponse,
)
def assess_match(
    match_id: int,
    db: Session = Depends(get_db),
):
    match = (
        db.query(MatchVerification)
        .filter(
            MatchVerification.id == match_id
        )
        .first()
    )

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match verification not found.",
        )

    finding = create_risk_finding(
        db=db,
        match=match,
    )

    try:
        evidence = json.loads(
            finding.evidence
        )
    except (TypeError, json.JSONDecodeError):
        evidence = {
            "raw_evidence": finding.evidence
        }

    return RiskAssessmentResponse(
        finding_id=finding.id,
        identity_id=finding.identity_id,
        match_id=finding.match_id,
        risk_score=finding.risk_score,
        risk_level=finding.risk_level,
        finding_type=finding.finding_type,
        title=finding.title,
        description=finding.description,
        status=finding.status,
        created_at=finding.created_at,
        evidence=evidence,
    )


@router.get(
    "/findings/{identity_id}",
    response_model=list[RiskAssessmentResponse],
)
def get_findings(
    identity_id: int,
    db: Session = Depends(get_db),
):
    findings = (
        db.query(RiskFinding)
        .filter(
            RiskFinding.identity_id == identity_id
        )
        .order_by(
            RiskFinding.id.desc()
        )
        .all()
    )

    response = []

    for finding in findings:
        try:
            evidence = json.loads(
                finding.evidence
            )
        except (TypeError, json.JSONDecodeError):
            evidence = {
                "raw_evidence": finding.evidence
            }

        response.append(
            RiskAssessmentResponse(
                finding_id=finding.id,
                identity_id=finding.identity_id,
                match_id=finding.match_id,
                risk_score=finding.risk_score,
                risk_level=finding.risk_level,
                finding_type=finding.finding_type,
                title=finding.title,
                description=finding.description,
                status=finding.status,
                created_at=finding.created_at,
                evidence=evidence,
            )
        )

    return response


@router.get(
    "/summary/{identity_id}",
    response_model=RiskSummaryResponse,
)
def get_risk_summary(
    identity_id: int,
    db: Session = Depends(get_db),
):
    findings = (
        db.query(RiskFinding)
        .filter(
            RiskFinding.identity_id == identity_id
        )
        .all()
    )

    critical = sum(
        finding.risk_level == "CRITICAL"
        for finding in findings
    )

    high = sum(
        finding.risk_level == "HIGH"
        for finding in findings
    )

    medium = sum(
        finding.risk_level == "MEDIUM"
        for finding in findings
    )

    low = sum(
        finding.risk_level == "LOW"
        for finding in findings
    )

    highest = max(
        (finding.risk_score for finding in findings),
        default=0.0,
    )

    return RiskSummaryResponse(
        identity_id=identity_id,
        total_findings=len(findings),
        critical=critical,
        high=high,
        medium=medium,
        low=low,
        highest_risk_score=highest,
    )