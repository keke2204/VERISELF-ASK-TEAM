from __future__ import annotations

import json
from datetime import datetime, timezone
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.models.evidence import EvidenceRecord
from app.models.legal_response import LegalResponse
from app.models.risk import RiskFinding


ALLOWED_STATUSES = {
    "DRAFTED",
    "READY_FOR_REVIEW",
    "SUBMITTED",
    "PENDING_REVIEW",
    "RESOLVED",
    "REJECTED",
    "NO_RESPONSE",
}


def _domain_from_url(url: str) -> str | None:
    try:
        return urlparse(url).hostname
    except Exception:
        return None


def _load_evidence(
    evidence: EvidenceRecord,
) -> dict:

    try:
        return json.loads(
            evidence.evidence_data
        )
    except (
        TypeError,
        json.JSONDecodeError,
    ):
        return {
            "raw_evidence": evidence.evidence_data
        }


def generate_takedown_notice(
    db: Session,
    *,
    finding: RiskFinding,
    evidence: EvidenceRecord,
    jurisdiction: str = "US",
    rights_holder_name: str = "Identity Owner",
    rights_holder_email: str = "owner@example.com",
) -> LegalResponse:

    evidence_data = _load_evidence(evidence)

    target_url = evidence.source_url
    target_domain = (
        evidence.source_domain
        or _domain_from_url(target_url)
    )

    subject = (
        "Request for removal of unauthorized "
        "identity-related content"
    )

    notice_body = f"""
FORMAL CONTENT REMOVAL REQUEST

Jurisdiction / framework:
{jurisdiction}

Rights holder / affected identity:
{rights_holder_name}

Contact email:
{rights_holder_email}

Target URL:
{target_url}

Target domain:
{target_domain or "Unknown"}

VeriSelf finding:
{finding.title}

Finding type:
{finding.finding_type}

Risk level:
{finding.risk_level}

Risk score:
{finding.risk_score}/100

Evidence record:
{evidence.id}

Evidence integrity hash:
{evidence.content_hash or "Unavailable"}

The referenced URL contains material that has been
flagged by VeriSelf for review as potentially involving
unauthorized use of the registered identity.

The requester asks the relevant website operator,
service provider, or designated abuse/contact channel
to review the referenced material and take appropriate
action under the applicable law, platform policy, or
terms of service.

The requester represents, to the best of their knowledge,
that the information supplied in this notice is accurate
and that they are authorized to make this request.

This notice is a request for review and removal where
legally applicable. VeriSelf does not represent that
removal has occurred unless the recipient confirms it.

Target URL:
{target_url}
""".strip()

    response = LegalResponse(
        identity_id=finding.identity_id,
        finding_id=finding.id,
        evidence_id=evidence.id,
        response_type="TAKEDOWN_NOTICE",
        jurisdiction=jurisdiction.upper(),
        target_url=target_url,
        target_domain=target_domain,
        recipient=None,
        subject=subject,
        notice_body=notice_body,
        status="DRAFTED",
    )

    db.add(response)
    db.commit()
    db.refresh(response)

    return response


def update_legal_response_status(
    db: Session,
    *,
    response_id: int,
    status: str,
    submission_reference: str | None = None,
    resolution_notes: str | None = None,
) -> LegalResponse:

    normalized_status = status.upper()

    if normalized_status not in ALLOWED_STATUSES:
        raise ValueError(
            "Invalid legal response status."
        )

    response = (
        db.query(LegalResponse)
        .filter(
            LegalResponse.id == response_id
        )
        .first()
    )

    if response is None:
        raise ValueError(
            "Legal response not found."
        )

    response.status = normalized_status

    if submission_reference is not None:
        response.submission_reference = (
            submission_reference
        )

    if resolution_notes is not None:
        response.resolution_notes = (
            resolution_notes
        )

    if normalized_status == "SUBMITTED":
        response.submitted_at = datetime.now(
            timezone.utc
        )

    db.commit()
    db.refresh(response)

    return response