from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class MatchVerification(Base):
    __tablename__ = "match_verifications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    identity_id: Mapped[int] = mapped_column(
        ForeignKey("identity_profiles.id"),
        nullable=False,
        index=True,
    )

    candidate_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    phash_distance: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    face_similarity: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    combined_score: Mapped[float] = mapped_column(
        nullable=False,
    )

    classification: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    risk_level: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    evidence: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )