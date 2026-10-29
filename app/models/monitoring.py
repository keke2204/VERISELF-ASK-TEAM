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


class MonitoringTarget(Base):
    __tablename__ = "monitoring_targets"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    target_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    target_type: Mapped[str] = mapped_column(
        String(30),
        default="website",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="active",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class MonitoringResult(Base):
    __tablename__ = "monitoring_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    target_id: Mapped[int] = mapped_column(
        ForeignKey("monitoring_targets.id"),
        nullable=False,
        index=True,
    )

    page_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    candidate_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    candidate_type: Mapped[str] = mapped_column(
        String(30),
        default="image",
        nullable=False,
    )

    page_title: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    content_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="discovered",
        nullable=False,
    )

    evidence_reference: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )