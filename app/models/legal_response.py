from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class LegalResponse(Base):
    __tablename__ = "legal_responses"

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

    finding_id: Mapped[int | None] = mapped_column(
        ForeignKey("risk_findings.id"),
        nullable=True,
        index=True,
    )

    evidence_id: Mapped[int | None] = mapped_column(
        ForeignKey("evidence_records.id"),
        nullable=True,
        index=True,
    )

    response_type: Mapped[str] = mapped_column(
        String(50),
        default="TAKEDOWN_NOTICE",
        nullable=False,
    )

    jurisdiction: Mapped[str] = mapped_column(
        String(50),
        default="US",
        nullable=False,
    )

    target_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    target_domain: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    recipient: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    subject: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    notice_body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(40),
        default="DRAFTED",
        nullable=False,
    )

    submission_reference: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    resolution_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )