from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.evidence import EvidenceRecord
from app.models.risk import RiskFinding
from app.models.security_alert import SecurityAlert


ALERT_LEVELS = {
    "MEDIUM",
    "HIGH",
    "CRITICAL",
}


def create_alert_for_finding(
    db: Session,
    *,
    finding: RiskFinding,
    evidence: EvidenceRecord | None = None,
) -> SecurityAlert | None:

    if finding.risk_level not in ALERT_LEVELS:
        return None

    existing = (
        db.query(SecurityAlert)
        .filter(
            SecurityAlert.finding_id
            == finding.id
        )
        .first()
    )

    if existing is not None:
        return existing

    alert = SecurityAlert(
        identity_id=finding.identity_id,
        finding_id=finding.id,
        evidence_id=(
            evidence.id
            if evidence is not None
            else None
        ),
        severity=finding.risk_level,
        title=finding.title,
        message=(
            f"{finding.description} "
            f"Risk score: {finding.risk_score}/100."
        ),
        status="NEW",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def update_alert_status(
    db: Session,
    *,
    alert_id: int,
    status: str,
) -> SecurityAlert:

    allowed_statuses = {
        "NEW",
        "REVIEWED",
        "RESOLVED",
        "DISMISSED",
    }

    if status not in allowed_statuses:
        raise ValueError(
            "Invalid alert status."
        )

    alert = (
        db.query(SecurityAlert)
        .filter(
            SecurityAlert.id == alert_id
        )
        .first()
    )

    if alert is None:
        raise ValueError(
            "Alert not found."
        )

    alert.status = status

    db.commit()
    db.refresh(alert)

    return alert