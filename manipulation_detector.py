from pathlib import Path

import cv2
import numpy as np


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


def _clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, float(value)))


def _normalize(
    value: float,
    low: float,
    high: float,
) -> float:
    if high <= low:
        return 0.0

    normalized = (value - low) / (high - low)
    return _clamp(normalized)


def _calculate_noise_inconsistency(image: np.ndarray) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0,
    )

    residual = gray.astype(np.float32) - blurred.astype(np.float32)

    mean = float(np.mean(residual))
    standard_deviation = float(np.std(residual))

    absolute_residual = np.abs(residual)

    mean_absolute_residual = float(
        np.mean(absolute_residual)
    )

    if mean_absolute_residual <= 0:
        return 0.0

    coefficient = standard_deviation / (
        mean_absolute_residual + 1e-6
    )

    score = _normalize(
        coefficient,
        0.5,
        3.0,
    )

    return score


def _calculate_edge_density(image: np.ndarray) -> float:
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    edges = cv2.Canny(
        gray,
        100,
        200,
    )

    edge_pixels = float(np.count_nonzero(edges))
    total_pixels = float(edges.size)

    if total_pixels == 0:
        return 0.0

    density = edge_pixels / total_pixels

    return _clamp(density * 4.0)


def _calculate_texture_variation(image: np.ndarray) -> float:
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    laplacian = cv2.Laplacian(
        gray,
        cv2.CV_64F,
    )

    variance = float(
        laplacian.var()
    )

    return _normalize(
        variance,
        20.0,
        1000.0,
    )


def _calculate_channel_inconsistency(image: np.ndarray) -> float:
    b_channel, g_channel, r_channel = cv2.split(
        image.astype(np.float32)
    )

    blue_green = float(
        np.mean(
            np.abs(
                b_channel - g_channel
            )
        )
    )

    green_red = float(
        np.mean(
            np.abs(
                g_channel - r_channel
            )
        )
    )

    red_blue = float(
        np.mean(
            np.abs(
                r_channel - b_channel
            )
        )
    )

    average_difference = (
        blue_green
        + green_red
        + red_blue
    ) / 3.0

    return _normalize(
        average_difference,
        10.0,
        80.0,
    )


def _metadata_indicators(
    file_path: str,
) -> float:
    try:
        from PIL import Image

        with Image.open(file_path) as image:
            exif = image.getexif()

            if not exif:
                return 0.0

            software_tag = exif.get(305)

            if software_tag:
                return 0.5

            return 0.1

    except Exception:
        return 0.0


def analyze_image(file_path: str) -> dict:
    path = Path(file_path)

    if not path.exists():
        raise ValueError(
            "Image file does not exist."
        )

    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported image format."
        )

    image = cv2.imread(
        str(path)
    )

    if image is None:
        raise ValueError(
            "Image could not be decoded."
        )

    noise_score = _calculate_noise_inconsistency(
        image
    )

    edge_score = _calculate_edge_density(
        image
    )

    texture_score = _calculate_texture_variation(
        image
    )

    channel_score = _calculate_channel_inconsistency(
        image
    )

    metadata_score = _metadata_indicators(
        str(path)
    )

    manipulation_score = (
        noise_score * 0.35
        + texture_score * 0.20
        + channel_score * 0.20
        + edge_score * 0.10
        + metadata_score * 0.15
    )

    manipulation_score = _clamp(
        manipulation_score
    )

    if manipulation_score >= 0.75:
        risk_level = "CRITICAL"
        classification = (
            "HIGH_MANIPULATION_INDICATORS"
        )

    elif manipulation_score >= 0.55:
        risk_level = "HIGH"
        classification = (
            "POSSIBLE_MANIPULATION"
        )

    elif manipulation_score >= 0.30:
        risk_level = "MEDIUM"
        classification = "SUSPICIOUS"

    else:
        risk_level = "LOW"
        classification = (
            "NO_STRONG_MANIPULATION_INDICATORS"
        )

    artifacts = []

    if noise_score >= 0.60:
        artifacts.append(
            "Noise inconsistency detected"
        )

    if texture_score >= 0.60:
        artifacts.append(
            "Unusual texture variation detected"
        )

    if channel_score >= 0.60:
        artifacts.append(
            "Elevated RGB channel inconsistency detected"
        )

    if metadata_score >= 0.40:
        artifacts.append(
            "Image software metadata indicator detected"
        )

    return {
        "media_type": "image",
        "manipulation_score": round(
            manipulation_score,
            4,
        ),
        "manipulation_percentage": round(
            manipulation_score * 100,
            2,
        ),
        "risk_level": risk_level,
        "classification": classification,
        "signals": {
            "noise_inconsistency": round(
                noise_score,
                4,
            ),
            "edge_density": round(
                edge_score,
                4,
            ),
            "texture_variation": round(
                texture_score,
                4,
            ),
            "channel_inconsistency": round(
                channel_score,
                4,
            ),
            "metadata_indicators": round(
                metadata_score,
                4,
            ),
        },
        "artifacts": artifacts,
        "model": (
            "VeriSelf Forensic Baseline v1"
        ),
        "model_type": (
            "Explainable forensic heuristic"
        ),
        "message": (
            "This result represents forensic "
            "risk indicators and is not a "
            "definitive determination that "
            "the image is manipulated."
        ),
    }