from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.ml.manipulation_detector import (
    analyze_image,
)
from app.ml.video_manipulation_detector import (
    analyze_video,
)
from app.schemas.manipulation import (
    ManipulationAnalysisResponse,
    VideoManipulationAnalysisResponse,
)


router = APIRouter(
    prefix="/manipulation",
    tags=["Manipulation Detection"],
)


PROJECT_ROOT = Path(
    __file__
).resolve().parents[2]

RAW_DIR = (
    PROJECT_ROOT
    / "data"
    / "raw"
)

RAW_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

VIDEO_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024


async def _save_upload(
    file: UploadFile,
    allowed_extensions: set[str],
    max_size: int,
) -> Path:

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported media format."
            ),
        )

    contents = await file.read()

    if len(contents) > max_size:
        raise HTTPException(
            status_code=413,
            detail=(
                "Uploaded media exceeds "
                "the allowed size limit."
            ),
        )

    temporary_path = (
        RAW_DIR
        / f"analysis_{uuid4().hex}{extension}"
    )

    temporary_path.write_bytes(
        contents
    )

    return temporary_path


@router.post(
    "/analyze-image",
    response_model=ManipulationAnalysisResponse,
)
async def analyze_image_endpoint(
    file: UploadFile = File(...),
):

    temporary_path = await _save_upload(
        file,
        IMAGE_EXTENSIONS,
        MAX_IMAGE_SIZE,
    )

    try:

        return analyze_image(
            str(temporary_path)
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
    "/analyze-video",
    response_model=VideoManipulationAnalysisResponse,
)
async def analyze_video_endpoint(
    file: UploadFile = File(...),
):

    temporary_path = await _save_upload(
        file,
        VIDEO_EXTENSIONS,
        MAX_VIDEO_SIZE,
    )

    try:

        return analyze_video(
            str(temporary_path)
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    finally:

        if temporary_path.exists():
            temporary_path.unlink()