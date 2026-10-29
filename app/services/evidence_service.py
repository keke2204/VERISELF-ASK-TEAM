from __future__ import annotations

import hashlib
import json
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.models.evidence import EvidenceRecord
from app.models.match import MatchVerification
from app.models.risk import RiskFinding


def _source_domain(source_url: str) -> str | None:
    try:
        return urlparse(source_url).hostname
    except Exception:
        return None


def create_evidence_record(
    db: Session,
    *,
    match: MatchVerification,
    finding: RiskFinding,
) -> EvidenceRecord:

    try:
        match_evidence = json.loads(match.evidence)
    except (TypeError, json.JSONDecodeError):
        match_evidence = {
            "raw_evidence": match.evidence,
        }

    evidence_data = {
        "identity_id": match.identity_id,
        "match_id": match.id,
        "finding_id": finding.id,
        "candidate_url": match.candidate_url,
        "phash_distance": match.phash_distance,
        "face_similarity": match.face_similarity,
        "combined_score": match.combined_score,
        "classification": match.classification,
        "risk_level": match.risk_level,
        "risk_score": finding.risk_score,
        "finding_type": finding.finding_type,
        "match_evidence": match_evidence,
    }

    # Stable hash of the evidence package itself.
    serialized = json.dumps(
        evidence_data,
        sort_keys=True,
        ensure_ascii=False,
    ).encode("utf-8")

    content_hash = hashlib.sha256(
        serialized
    ).hexdigest()

    evidence = EvidenceRecord(
        identity_id=match.identity_id,
        match_id=match.id,
        finding_id=finding.id,
        evidence_type="match_analysis",
        source_url=match.candidate_url,
        source_domain=_source_domain(
            match.candidate_url
        ),
        content_hash=content_hash,
        evidence_data=json.dumps(
            evidence_data,
            ensure_ascii=False,
        ),
        status="preserved",
    )

    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return evidence