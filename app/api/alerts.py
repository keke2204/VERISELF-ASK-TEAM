from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.security_alert import SecurityAlert
from app.schemas.alert import (
    AlertResponse,
    AlertStatusUpdate,
)
from app.services.alert_service import (
    update_alert_status,
)


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts & Evidence"],
)


@router.get(
    "/{identity_id}",
    response_model=list[AlertResponse],
)
def get_alerts(
    identity_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(SecurityAlert)
        .filter(
            SecurityAlert.identity_id
            == identity_id
        )
        .order_by(
            SecurityAlert.id.desc()
        )
        .all()
    )


@router.patch(
    "/{alert_id}/status",
    response_model=AlertResponse,
)
def change_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db),
):
    try:
        return update_alert_status(
            db=db,
            alert_id=alert_id,
            status=payload.status.upper(),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc