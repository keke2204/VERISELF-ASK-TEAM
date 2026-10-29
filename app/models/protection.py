from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ProtectionRecord(Base):
    __tablename__ = "protection_records"

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

    original_sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    protected_sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    signature_token: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    protection_type: Mapped[str] = mapped_column(
        String(100),
        default="DCT_INVISIBLE_SIGNATURE",
        nullable=False,
    )

    visible_watermark: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    provenance_metadata: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )