from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.match import (
    MatchVerification,
)
from app.schemas.match import (
    MatchHistoryResponse,
    MatchVerificationRequest,
    MatchVerificationResponse,
)
from app.services.match_service import (
    verify_candidate_url,
)


router = APIRouter(
    prefix="/matches",
    tags=["Similarity & Match Verification"],
)


@router.post(
    "/verify",
    response_model=MatchVerificationResponse,
)
def verify_match(
    payload: MatchVerificationRequest,
    db: Session = Depends(get_db),
):

    try:

        return verify_candidate_url(
            db=db,
            identity_id=payload.identity_id,
            candidate_url=payload.candidate_url,
            authorized=payload.authorized,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@router.get(
    "/history/{identity_id}",
    response_model=list[
        MatchHistoryResponse
    ],
)
def get_match_history(
    identity_id: int,
    db: Session = Depends(get_db),
):

    return (
        db.query(
            MatchVerification
        )
        .filter(
            MatchVerification.identity_id
            == identity_id
        )
        .order_by(
            MatchVerification.id.desc()
        )
        .all()
    )