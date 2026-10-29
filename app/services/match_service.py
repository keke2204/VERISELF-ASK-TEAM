from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.models.identity import IdentityProfile
from app.models.match import MatchVerification
from app.ml.face_detector import crop_face, detect_faces
from app.ml.face_embedding import generate_face_embedding
from app.ml.manipulation_detector import analyze_image
from app.ml.phash_matcher import (
    calculate_phash,
    phash_hamming_distance,
    phash_similarity,
)
from app.ml.similarity import cosine_similarity
from app.services.candidate_fetcher import (
    download_candidate_image,
    save_candidate_temporarily,
)


FACE_MATCH_THRESHOLD = 0.70


def _load_registered_embedding(
    identity: IdentityProfile,
) -> list[float]:

    if not identity.embedding_reference:
        raise ValueError(
            "Registered face embedding is not available."
        )

    try:
        stored = json.loads(
            identity.embedding_reference
        )
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Registered face embedding is invalid."
        ) from exc

    if isinstance(stored, dict):
        embedding = stored.get("embedding")
    else:
        embedding = stored

    if not isinstance(embedding, list):
        raise ValueError(
            "Registered face embedding has an invalid format."
        )

    return [
        float(value)
        for value in embedding
    ]

def _classification(
    *,
    phash_distance: int | None,
    face_similarity: float | None,
    manipulation_score: float,
    authorized: bool,
) -> tuple[str, str]:

    if authorized:
        return "AUTHORIZED", "LOW"

    strong_phash = (
        phash_distance is not None
        and phash_distance <= 8
    )

    strong_face = (
        face_similarity is not None
        and face_similarity >= FACE_MATCH_THRESHOLD
    )

    if strong_face and manipulation_score >= 0.55:
        return "POSSIBLE_MANIPULATION", "HIGH"

    if strong_phash:
        return "UNAUTHORIZED_COPY", "HIGH"

    if strong_face:
        return "POSSIBLE_IMPERSONATION", "HIGH"

    if (
        face_similarity is not None
        and face_similarity >= 0.55
    ):
        return "POSSIBLE_IMPERSONATION", "MEDIUM"

    if manipulation_score >= 0.55:
        return "POSSIBLE_MANIPULATION", "HIGH"

    if manipulation_score >= 0.30:
        return "SUSPICIOUS_MEDIA", "MEDIUM"

    return "NO_STRONG_MATCH", "LOW"


def _combined_score(
    *,
    phash_score: float | None,
    face_similarity: float | None,
) -> float:

    available_scores = []

    if phash_score is not None:
        available_scores.append(
            float(phash_score)
        )

    if face_similarity is not None:
        available_scores.append(
            float(face_similarity)
        )

    if not available_scores:
        return 0.0

    return round(
        sum(available_scores)
        / len(available_scores),
        4,
    )


def verify_candidate_url(
    *,
    db: Session,
    identity_id: int,
    candidate_url: str,
    authorized: bool = False,
) -> dict:

    identity = (
        db.query(IdentityProfile)
        .filter(
            IdentityProfile.id == identity_id
        )
        .first()
    )

    if identity is None:
        raise ValueError(
            "Identity profile not found."
        )

    if not identity.identity_hash:
        raise ValueError(
            "Registered identity fingerprint is not available."
        )

    registered_embedding = (
        _load_registered_embedding(identity)
    )

    candidate_data, content_type = (
        download_candidate_image(candidate_url)
    )

    temporary_path = None

    try:
        temporary_path = save_candidate_temporarily(
            candidate_data,
            content_type,
        )

        # -------------------------------------------------
        # 1. Perceptual hash comparison
        # -------------------------------------------------

        candidate_phash = calculate_phash(
            str(temporary_path)
        )

        phash_distance = phash_hamming_distance(
            identity.identity_hash,
            candidate_phash,
        )

        phash_score = phash_similarity(
            phash_distance
        )

        # -------------------------------------------------
        # 2. Face detection + face embedding comparison
        # -------------------------------------------------

        face_boxes = detect_faces(
            str(temporary_path)
        )

        face_similarity = None

        if face_boxes:
            if len(face_boxes) > 1:
                # Use the largest detected face.
                face_box = max(
                    face_boxes,
                    key=lambda box: box[2] * box[3],
                )
            else:
                face_box = face_boxes[0]

            face_crop = crop_face(
                str(temporary_path),
                face_box,
            )

            candidate_embedding = (
                generate_face_embedding(face_crop)
            )

            face_similarity = round(
                cosine_similarity(
                    registered_embedding,
                    candidate_embedding,
                ),
                4,
            )

        # -------------------------------------------------
        # 3. Stage 5 manipulation analysis
        # -------------------------------------------------

        manipulation_result = analyze_image(
            str(temporary_path)
        )

        manipulation_score = float(
            manipulation_result.get(
                "manipulation_score",
                0.0,
            )
        )

        manipulation_risk_level = (
            manipulation_result.get(
                "risk_level"
            )
        )

        manipulation_classification = (
            manipulation_result.get(
                "classification"
            )
        )

        manipulation_artifacts = (
            manipulation_result.get(
                "artifacts",
                [],
            )
        )

        # -------------------------------------------------
        # 4. Combined similarity evidence
        # -------------------------------------------------

        combined_score = _combined_score(
            phash_score=phash_score,
            face_similarity=face_similarity,
        )

        classification, risk_level = (
            _classification(
                phash_distance=phash_distance,
                face_similarity=face_similarity,
                manipulation_score=manipulation_score,
                authorized=authorized,
            )
        )

        # -------------------------------------------------
        # 5. Evidence package
        # -------------------------------------------------

        evidence = {
            "candidate_url": candidate_url,
            "candidate_content_type": content_type,
            "phash_distance": phash_distance,
            "phash_similarity": phash_score,
            "face_similarity": face_similarity,
            "face_detected": bool(face_boxes),
            "face_count": len(face_boxes),
            "manipulation_score": manipulation_score,
            "manipulation_risk_level": (
                manipulation_risk_level
            ),
            "manipulation_classification": (
                manipulation_classification
            ),
            "manipulation_artifacts": (
                manipulation_artifacts
            ),
            "authorized": authorized,
            "face_match_threshold": FACE_MATCH_THRESHOLD,
            "classification": classification,
            "risk_level": risk_level,
        }

        # -------------------------------------------------
        # 6. Save verification result
        # -------------------------------------------------

        match = MatchVerification(
            identity_id=identity_id,
            candidate_url=candidate_url,
            phash_distance=phash_distance,
            face_similarity=face_similarity,
            combined_score=combined_score,
            classification=classification,
            risk_level=risk_level,
            evidence=json.dumps(
                evidence,
                ensure_ascii=False,
            ),
        )

        db.add(match)
        db.commit()
        db.refresh(match)

        return {
            "match_id": match.id,
            "identity_id": identity_id,
            "candidate_url": candidate_url,
            "phash_distance": phash_distance,
            "phash_similarity": phash_score,
            "face_similarity": face_similarity,
            "combined_score": combined_score,
            "combined_percentage": round(
                combined_score * 100,
                2,
            ),
            "classification": classification,
            "risk_level": risk_level,
            "evidence": evidence,
        }

    finally:
        # Always remove the temporary candidate image.
        if temporary_path is not None:
            try:
                temporary_path.unlink(
                    missing_ok=True
                )
            except OSError:
                pass