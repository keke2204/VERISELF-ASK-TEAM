from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RiskAssessment:
    score: float
    level: str
    finding_type: str
    title: str
    description: str


def _clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, value))


def calculate_risk_score(
    *,
    face_similarity: float | None,
    phash_distance: int | None,
    manipulation_score: float = 0.0,
    classification: str = "NO_STRONG_MATCH",
) -> RiskAssessment:

    score = 0.0

    # Face similarity contribution
    if face_similarity is not None:
        face_similarity = _clamp(face_similarity, 0.0, 1.0)

        if face_similarity >= 0.70:
            score += 40.0
        elif face_similarity >= 0.55:
            score += 25.0
        elif face_similarity >= 0.40:
            score += 10.0

    # pHash contribution
    if phash_distance is not None:
        if phash_distance <= 8:
            score += 30.0
        elif phash_distance <= 16:
            score += 18.0
        elif phash_distance <= 24:
            score += 8.0

    # Manipulation contribution
    manipulation_score = _clamp(
        manipulation_score,
        0.0,
        1.0,
    )

    score += manipulation_score * 25.0

    # Classification-specific adjustment
    if classification == "POSSIBLE_IMPERSONATION":
        score += 10.0

    elif classification == "POSSIBLE_MANIPULATION":
        score += 15.0

    elif classification == "UNAUTHORIZED_COPY":
        score += 12.0

    elif classification == "AUTHORIZED":
        score -= 35.0

    score = round(
        _clamp(score),
        2,
    )

    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    if classification == "AUTHORIZED":
        finding_type = "AUTHORIZED_MATCH"
        title = "Authorized identity match"
        description = (
            "The candidate is similar to the registered identity "
            "and has been explicitly marked as authorized."
        )

    elif classification == "POSSIBLE_MANIPULATION":
        finding_type = "POSSIBLE_MANIPULATION"
        title = "Possible manipulated identity media"
        description = (
            "The candidate appears related to the registered identity "
            "and contains indicators associated with possible manipulation."
        )

    elif classification == "POSSIBLE_IMPERSONATION":
        finding_type = "POSSIBLE_IMPERSONATION"
        title = "Possible identity impersonation"
        description = (
            "The candidate has meaningful facial similarity with the "
            "registered identity and may represent an unauthorized use."
        )

    elif classification == "UNAUTHORIZED_COPY":
        finding_type = "UNAUTHORIZED_COPY"
        title = "Possible unauthorized copy"
        description = (
            "The candidate has strong perceptual similarity to registered "
            "identity media."
        )

    else:
        finding_type = "LOW_CONFIDENCE_MATCH"
        title = "Low-confidence similarity"
        description = (
            "The available evidence does not establish a strong identity match."
        )

    return RiskAssessment(
        score=score,
        level=level,
        finding_type=finding_type,
        title=title,
        description=description,
    )