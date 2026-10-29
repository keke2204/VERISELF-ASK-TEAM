from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.monitoring import (
    MonitoringResult,
    MonitoringTarget,
)
from app.schemas.monitoring import (
    MonitoringResultResponse,
    MonitoringScanResponse,
    MonitoringTargetCreate,
    MonitoringTargetResponse,
)
from app.services.web_monitor import (
    crawl_public_page,
)


router = APIRouter(
    prefix="/monitoring",
    tags=["Public Web Monitoring"],
)


def _run_background_scan(
    target_id: int,
) -> None:

    # BackgroundTasks intentionally gets its
    # own database session.
    from app.db.database import SessionLocal

    db = SessionLocal()

    try:

        target = db.get(
            MonitoringTarget,
            target_id,
        )

        if target is None:
            return

        try:

            result = crawl_public_page(
                target.target_url
            )

            if result["success"]:

                for candidate in (
                    result["candidates"]
                ):

                    existing = (
                        db.query(
                            MonitoringResult
                        )
                        .filter(
                            MonitoringResult.target_id
                            == target.id,
                            MonitoringResult.candidate_url
                            == candidate.image_url,
                        )
                        .first()
                    )

                    if existing:
                        continue

                    db.add(
                        MonitoringResult(
                            target_id=target.id,
                            page_url=(
                                candidate.page_url
                            ),
                            candidate_url=(
                                candidate.image_url
                            ),
                            candidate_type="image",
                            page_title=(
                                candidate.page_title
                            ),
                            content_hash=(
                                candidate.content_hash
                            ),
                            status="discovered",
                        )
                    )

                db.commit()

        except Exception:

            db.rollback()

    finally:

        db.close()


@router.post(
    "/targets",
    response_model=MonitoringTargetResponse,
    status_code=201,
)
def create_monitoring_target(
    payload: MonitoringTargetCreate,
    db: Session = Depends(get_db),
):

    from app.services.web_monitor import (
        validate_target_url,
    )

    try:

        validated_url = (
            validate_target_url(
                payload.target_url
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    target = MonitoringTarget(
        user_id=payload.user_id,
        target_url=validated_url,
        target_type="website",
        status="active",
    )

    db.add(target)
    db.commit()
    db.refresh(target)

    return target


@router.get(
    "/targets/{user_id}",
    response_model=list[
        MonitoringTargetResponse
    ],
)
def get_monitoring_targets(
    user_id: int,
    db: Session = Depends(get_db),
):

    return (
        db.query(
            MonitoringTarget
        )
        .filter(
            MonitoringTarget.user_id
            == user_id
        )
        .order_by(
            MonitoringTarget.id.desc()
        )
        .all()
    )


@router.post(
    "/targets/{target_id}/scan",
    response_model=MonitoringScanResponse,
)
def scan_monitoring_target(
    target_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):

    target = db.get(
        MonitoringTarget,
        target_id,
    )

    if target is None:
        raise HTTPException(
            status_code=404,
            detail="Monitoring target not found.",
        )

    # The scan runs after the API returns,
    # preventing the request from blocking
    # while the public page is fetched.
    background_tasks.add_task(
        _run_background_scan,
        target.id,
    )

    return {
        "target_id": target.id,
        "success": True,
        "reason": (
            "Background monitoring scan "
            "started."
        ),
        "page_url": target.target_url,
        "title": None,
        "candidates_found": 0,
    }


@router.get(
    "/results/{target_id}",
    response_model=list[
        MonitoringResultResponse
    ],
)
def get_monitoring_results(
    target_id: int,
    db: Session = Depends(get_db),
):

    target = db.get(
        MonitoringTarget,
        target_id,
    )

    if target is None:
        raise HTTPException(
            status_code=404,
            detail="Monitoring target not found.",
        )

    return (
        db.query(
            MonitoringResult
        )
        .filter(
            MonitoringResult.target_id
            == target_id
        )
        .order_by(
            MonitoringResult.id.desc()
        )
        .all()
    )