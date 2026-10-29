from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.identity import (
    IdentityRegistrationResponse,
    IdentityVerificationResponse,
)
from app.services.identity_service import (
    register_identity,
    verify_identity,
)

router = APIRouter(
    prefix="/identity",
    tags=["Identity"],
)

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

RAW_DIR = (
    PROJECT_ROOT
    / "data"
    / "raw"
)

RAW_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


async def save_temporary_upload(
    file: UploadFile,
) -> Path:

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Use JPG, JPEG, PNG, or WEBP."
            ),
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                "Image is too large. "
                "Maximum allowed size is 10 MB."
            ),
        )

    temporary_path = (
        RAW_DIR
        / f"registration_{uuid4().hex}{extension}"
    )

    temporary_path.write_bytes(contents)

    return temporary_path


@router.post(
    "/register",
    response_model=IdentityRegistrationResponse,
)
async def register_identity_endpoint(
    user_id: int = Form(...),
    display_name: str = Form(
        ...,
        max_length=120,
    ),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    temporary_path = await save_temporary_upload(
        file
    )

    try:

        return register_identity(
            db=db,
            user_id=user_id,
            display_name=display_name.strip(),
            file_path=str(temporary_path),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    finally:

        if temporary_path.exists():
            temporary_path.unlink()


@router.post(
    "/verify",
    response_model=IdentityVerificationResponse,
)
async def verify_identity_endpoint(
    identity_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    temporary_path = await save_temporary_upload(
        file
    )

    try:

        return verify_identity(
            db=db,
            identity_id=identity_id,
            file_path=str(temporary_path),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    finally:

        if temporary_path.exists():
            temporary_path.unlink()
