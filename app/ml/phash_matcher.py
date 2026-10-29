from pathlib import Path

from PIL import Image
import imagehash


STRONG_PHASH_DISTANCE = 8


def calculate_phash(
    file_path: str,
) -> str:

    path = Path(file_path)

    if not path.exists():
        raise ValueError(
            "Image file does not exist."
        )

    try:
        with Image.open(path) as image:
            image = image.convert("RGB")
            return str(
                imagehash.phash(image)
            )

    except Exception as exc:
        raise ValueError(
            "Unable to calculate perceptual hash."
        ) from exc


def phash_hamming_distance(
    hash_a: str,
    hash_b: str,
) -> int:

    try:
        value_a = imagehash.hex_to_hash(
            hash_a
        )

        value_b = imagehash.hex_to_hash(
            hash_b
        )

    except Exception as exc:
        raise ValueError(
            "Invalid perceptual hash."
        ) from exc

    return int(
        value_a - value_b
    )


def phash_similarity(
    distance: int,
) -> float:

    # pHash is normally 64 bits.
    maximum_distance = 64

    distance = max(
        0,
        min(
            maximum_distance,
            distance,
        ),
    )

    return round(
        1.0
        - (
            distance
            / maximum_distance
        ),
        4,
    )


def is_strong_phash_match(
    distance: int,
) -> bool:

    return (
        distance
        <= STRONG_PHASH_DISTANCE
    )