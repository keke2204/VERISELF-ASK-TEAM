from pathlib import Path
import hashlib

from PIL import Image
import imagehash


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


def validate_image(file_path: str) -> dict:
    path = Path(file_path)

    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return {
            "valid": False,
            "reason": "Unsupported image format",
        }

    try:
        with Image.open(path) as image:
            image.verify()

        return {
            "valid": True,
            "reason": None,
        }

    except Exception:
        return {
            "valid": False,
            "reason": "Invalid or corrupted image",
        }


def calculate_image_fingerprint(
    file_path: str,
) -> dict:

    path = Path(file_path)

    with Image.open(path) as original_image:

        # Capture the format BEFORE converting the image.
        image_format = (
            original_image.format
            or path.suffix.replace(".", "").upper()
        )

        image = original_image.convert("RGB")

        perceptual_hash = str(
            imagehash.phash(image)
        )

        with path.open("rb") as file:
            sha256_hash = hashlib.sha256(
                file.read()
            ).hexdigest()

        return {
            "phash": perceptual_hash,
            "sha256": sha256_hash,
            "width": image.width,
            "height": image.height,
            "format": image_format,
        }