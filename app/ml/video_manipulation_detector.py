from pathlib import Path

import cv2
import numpy as np


ALLOWED_VIDEO_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
}


def _clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:
    return max(
        minimum,
        min(maximum, float(value)),
    )


def _frame_metrics(
    frame: np.ndarray,
) -> tuple[float, float, float]:

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY,
    )

    brightness = float(
        np.mean(gray)
    ) / 255.0

    edges = cv2.Canny(
        gray,
        100,
        200,
    )

    edge_density = (
        float(np.count_nonzero(edges))
        / float(edges.size)
    )

    edge_density = _clamp(
        edge_density * 4.0
    )

    laplacian = cv2.Laplacian(
        gray,
        cv2.CV_64F,
    )

    texture = float(
        laplacian.var()
    )

    texture = min(
        texture / 1000.0,
        1.0,
    )

    return (
        brightness,
        edge_density,
        texture,
    )


def _variation_score(
    values: list[float],
) -> float:

    if not values:
        return 0.0

    array = np.asarray(
        values,
        dtype=np.float32,
    )

    mean = float(
        np.mean(array)
    )

    if mean <= 1e-8:
        return 0.0

    standard_deviation = float(
        np.std(array)
    )

    coefficient = (
        standard_deviation
        / mean
    )

    return _clamp(
        coefficient * 3.0
    )


def analyze_video(
    file_path: str,
) -> dict:

    path = Path(file_path)

    if not path.exists():
        raise ValueError(
            "Video file does not exist."
        )

    if (
        path.suffix.lower()
        not in ALLOWED_VIDEO_EXTENSIONS
    ):
        raise ValueError(
            "Unsupported video format."
        )

    capture = cv2.VideoCapture(
        str(path)
    )

    if not capture.isOpened():
        raise ValueError(
            "Video could not be opened."
        )

    frame_count = int(
        capture.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    fps = float(
        capture.get(
            cv2.CAP_PROP_FPS
        )
    )

    if fps <= 0:
        fps = 0.0

    duration_seconds = (
        frame_count / fps
        if fps > 0
        else 0.0
    )

    sample_count = min(
        24,
        max(frame_count, 0),
    )

    if sample_count == 0:
        capture.release()
        raise ValueError(
            "Video contains no readable frames."
        )

    sample_indices = np.linspace(
        0,
        max(frame_count - 1, 0),
        sample_count,
        dtype=int,
    )

    brightness_values = []
    edge_values = []
    texture_values = []
    temporal_differences = []

    previous_gray = None

    for frame_index in sample_indices:

        capture.set(
            cv2.CAP_PROP_POS_FRAMES,
            int(frame_index),
        )

        success, frame = capture.read()

        if not success:
            continue

        brightness, edge, texture = (
            _frame_metrics(frame)
        )

        brightness_values.append(
            brightness
        )

        edge_values.append(
            edge
        )

        texture_values.append(
            texture
        )

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY,
        )

        if previous_gray is not None:

            resized_gray = cv2.resize(
                gray,
                (320, 320),
            )

            resized_previous = cv2.resize(
                previous_gray,
                (320, 320),
            )

            difference = cv2.absdiff(
                resized_gray,
                resized_previous,
            )

            temporal_difference = (
                float(np.mean(difference))
                / 255.0
            )

            temporal_differences.append(
                temporal_difference
            )

        previous_gray = gray

    capture.release()

    sampled_frames = len(
        brightness_values
    )

    if sampled_frames == 0:
        raise ValueError(
            "No video frames could be sampled."
        )

    brightness_variation = (
        _variation_score(
            brightness_values
        )
    )

    edge_variation = (
        _variation_score(
            edge_values
        )
    )

    texture_variation = (
        _variation_score(
            texture_values
        )
    )

    temporal_difference_score = (
        _variation_score(
            temporal_differences
        )
    )

    manipulation_score = (
        brightness_variation * 0.25
        + edge_variation * 0.20
        + texture_variation * 0.20
        + temporal_difference_score * 0.35
    )

    manipulation_score = _clamp(
        manipulation_score
    )

    if manipulation_score >= 0.75:

        risk_level = "CRITICAL"

        classification = (
            "HIGH_TEMPORAL_MANIPULATION_INDICATORS"
        )

    elif manipulation_score >= 0.55:

        risk_level = "HIGH"

        classification = (
            "POSSIBLE_VIDEO_MANIPULATION"
        )

    elif manipulation_score >= 0.30:

        risk_level = "MEDIUM"

        classification = "SUSPICIOUS_VIDEO"

    else:

        risk_level = "LOW"

        classification = (
            "NO_STRONG_MANIPULATION_INDICATORS"
        )

    return {
        "media_type": "video",
        "frame_count": frame_count,
        "sampled_frames": sampled_frames,
        "fps": round(fps, 4),
        "duration_seconds": round(
            duration_seconds,
            4,
        ),
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
            "brightness_variation": round(
                brightness_variation,
                4,
            ),
            "edge_variation": round(
                edge_variation,
                4,
            ),
            "texture_variation": round(
                texture_variation,
                4,
            ),
            "temporal_difference": round(
                temporal_difference_score,
                4,
            ),
        },
        "model": (
            "VeriSelf Temporal "
            "Forensic Baseline v1"
        ),
        "model_type": (
            "Frame-sampling temporal heuristic"
        ),
        "message": (
            "This result represents temporal "
            "forensic risk indicators and is "
            "not a definitive determination "
            "that the video is manipulated."
        ),
    }