import json

from sqlalchemy.orm import Session

from app.models.identity import IdentityProfile
from app.services.media_service import (
    calculate_image_fingerprint,
    validate_image,
)
from app.ml.face_detector import (
    crop_face,
    detect_faces,
)
from app.ml.face_embedding import (
    EMBEDDING_MODEL_NAME,
    generate_face_embedding,
)
from app.ml.similarity import (
    cosine_similarity,
)


def register_identity(
    db: Session,
    user_id: int,
    display_name: str,
    file_path: str,
) -> dict:

    validation = validate_image(
        file_path
    )

    if not validation["valid"]:
        raise ValueError(
            validation["reason"]
        )

    fingerprint = (
        calculate_image_fingerprint(
            file_path
        )
    )

    faces = detect_faces(
        file_path
    )

    if len(faces) == 0:
        raise ValueError(
            "No usable face was detected."
        )

    if len(faces) > 1:
        raise ValueError(
            "Multiple faces were detected. "
            "Please use an image containing one person."
        )

    face = crop_face(
        file_path,
        faces[0],
    )

    embedding = (
        generate_face_embedding(
            face
        )
    )

    metadata = {
        "sha256": fingerprint["sha256"],
        "width": fingerprint["width"],
        "height": fingerprint["height"],
        "format": fingerprint["format"],
        "face_count": len(faces),
        "embedding_dimension": len(embedding),
        "embedding_model": EMBEDDING_MODEL_NAME,
    }

    profile = IdentityProfile(
        user_id=user_id,
        display_name=display_name,
        registration_status="registered",
        identity_hash=fingerprint["phash"],
        embedding_reference=json.dumps(
            {
                "embedding": embedding,
                "metadata": metadata,
            }
        ),
    )

    db.add(profile)

    db.commit()

    db.refresh(profile)

    return {
        "registration_id": profile.id,
        "user_id": profile.user_id,
        "status": profile.registration_status,
        "face_detected": True,
        "face_count": len(faces),
        "phash": fingerprint["phash"],
        "sha256": fingerprint["sha256"],
        "image_width": fingerprint["width"],
        "image_height": fingerprint["height"],
        "image_format": fingerprint["format"],
        "embedding_dimension": len(embedding),
        "message": (
            "Identity registered successfully. "
        "A 512-dimensional visual embedding "
        "and image fingerprint were generated."
        ),
    }


def load_registered_embedding(
    profile: IdentityProfile,
) -> list[float]:

    if not profile.embedding_reference:
        raise ValueError(
            "No biometric embedding is registered."
        )

    stored = json.loads(
        profile.embedding_reference
    )

    embedding = stored.get(
        "embedding"
    )

    if not embedding:
        raise ValueError(
            "Registered biometric embedding is missing."
        )

    return embedding


def verify_identity(
    db: Session,
    identity_id: int,
    file_path: str,
) -> dict:

    profile = db.get(
        IdentityProfile,
        identity_id,
    )

    if profile is None:
        raise ValueError(
            "Identity registration was not found."
        )

    validation = validate_image(
        file_path
    )

    if not validation["valid"]:
        raise ValueError(
            validation["reason"]
        )

    faces = detect_faces(
        file_path
    )

    if len(faces) == 0:
        raise ValueError(
            "No usable face was detected."
        )

    if len(faces) > 1:
        raise ValueError(
            "Multiple faces were detected."
        )

    face = crop_face(
        file_path,
        faces[0],
    )

    new_embedding = (
        generate_face_embedding(
            face
        )
    )

    registered_embedding = (
        load_registered_embedding(
            profile
        )
    )

    similarity = cosine_similarity(
        registered_embedding,
        new_embedding,
    )

    threshold = 0.70

    matched = (
        similarity >= threshold
    )

    return {
        "identity_id": profile.id,
        "display_name": profile.display_name,
        "face_detected": True,
        "similarity": round(
            similarity,
            4,
        ),
        "similarity_percentage": round(
            max(
                0.0,
                min(
                    1.0,
                    similarity,
                ),
            )
            * 100,
            2,
        ),
        "threshold": threshold,
        "matched": matched,
        "message": (
            "Face similarity is above "
            "the development threshold."
            if matched
            else
            "Face similarity is below "
            "the development threshold."
        ),
    }
