from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.api.protection import (
    router as protection_router,
)
from app.api.identity import router as identity_router
from app.api.monitoring import router as monitoring_router
from app.api.match import router as match_router
from app.api.risk import router as risk_router
from app.api.alerts import router as alerts_router
from app.api.evidence import router as evidence_router
from app.api.legal_response import (
    router as legal_response_router,
)
from app.api.manipulation import (
    router as manipulation_router,
)
router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "VeriSelf API",
    }


protected = {"dependencies": [Depends(get_current_user)]}
router.include_router(identity_router, **protected)
router.include_router(monitoring_router, **protected)
router.include_router(match_router, **protected)
router.include_router(risk_router, **protected)
router.include_router(alerts_router, **protected)
router.include_router(evidence_router, **protected)
router.include_router(legal_response_router, **protected)
router.include_router(protection_router, **protected)
router.include_router(manipulation_router, **protected)
