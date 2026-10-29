from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from facenet_pytorch import MTCNN


_FACE_DETECTOR = MTCNN(
    image_size=160,
    margin=20,
    keep_all=True,
    post_process=False,
)


def detect_faces(
    file_path: str,
) -> list[tuple[int, int, int, int]]:

    path = Path(file_path)

    if not path.exists():
        raise ValueError("Image file does not exist.")

    image = Image.open(path).convert("RGB")

    boxes, probabilities = _FACE_DETECTOR.detect(
        image
    )

    if boxes is None:
        return []

    faces = []

    for box, probability in zip(
        boxes,
        probabilities,
    ):
        if probability is None:
            continue

        if probability < 0.90:
            continue

        x1, y1, x2, y2 = box

        width = max(
            0,
            int(x2 - x1),
        )

        height = max(
            0,
            int(y2 - y1),
        )

        faces.append(
            (
                int(x1),
                int(y1),
                width,
                height,
            )
        )

    return faces


def crop_face(
    file_path: str,
    face_box: tuple[int, int, int, int],
):
    image = cv2.imread(
        str(file_path)
    )

    if image is None:
        raise ValueError(
            "Image could not be read by OpenCV."
        )

    x, y, width, height = face_box

    image_height, image_width = (
        image.shape[:2]
    )

    x1 = max(
        0,
        x,
    )

    y1 = max(
        0,
        y,
    )

    x2 = min(
        image_width,
        x + width,
    )

    y2 = min(
        image_height,
        y + height,
    )

    face = image[
        y1:y2,
        x1:x2,
    ]

    if face.size == 0:
        raise ValueError(
            "Detected face crop is empty."
        )

    return face