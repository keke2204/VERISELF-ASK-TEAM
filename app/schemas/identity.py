from pydantic import BaseModel


class IdentityRegistrationResponse(BaseModel):
    registration_id: int
    user_id: int
    status: str
    face_detected: bool
    face_count: int
    phash: str
    sha256: str
    image_width: int
    image_height: int
    image_format: str
    embedding_dimension: int
    message: str


class IdentityVerificationResponse(BaseModel):
    identity_id: int
    display_name: str
    face_detected: bool
    similarity: float
    similarity_percentage: float
    threshold: float
    matched: bool
    message: str