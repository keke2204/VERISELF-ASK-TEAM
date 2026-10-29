from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.models.match import MatchVerification
from app.models.risk import RiskFinding
from app.services.alert_service import (
    create_alert_for_finding,
)
from app.services.evidence_service import (
    create_evidence_record,
)
from app.services.risk_engine import (
    calculate_risk_score,
)


def create_risk_finding(
    db: Session,
    match: MatchVerification,
) -> RiskFinding:

    evidence_data = {}

    try:
        evidence_data = json.loads(
            match.evidence
        )
    except (
        TypeError,
        json.JSONDecodeError,
    ):
        evidence_data = {
            "raw_evidence": match.evidence,
        }

    manipulation_score = float(
        evidence_data.get(
            "manipulation_score",
            0.0,
        )
    )

    assessment = calculate_risk_score(
        face_similarity=match.face_similarity,
        phash_distance=match.phash_distance,
        manipulation_score=manipulation_score,
        classification=match.classification,
    )

    evidence_data.update(
        {
            "risk_engine_version": "0.1",
            "risk_score": assessment.score,
            "risk_level": assessment.level,
        }
    )

    finding = RiskFinding(
        identity_id=match.identity_id,
        match_id=match.id,
        risk_score=assessment.score,
        risk_level=assessment.level,
        finding_type=assessment.finding_type,
        title=assessment.title,
        description=assessment.description,
        evidence=json.dumps(
            evidence_data,
            ensure_ascii=False,
        ),
        status="open",
    )

    db.add(finding)
    db.commit()
    db.refresh(finding)

    # Preserve structured evidence.
    evidence = create_evidence_record(
        db=db,
        match=match,
        finding=finding,
    )

    # Generate an alert for actionable risk levels.
    create_alert_for_finding(
        db=db,
        finding=finding,
        evidence=evidence,
    )

    return finding