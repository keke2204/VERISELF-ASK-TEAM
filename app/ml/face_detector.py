from pathlib import Path
import os

import cv2
import numpy as np
from PIL import Image


USE_MTCNN = os.getenv("VERI_USE_FACE_MODEL", "0").lower() in {
    "1",
    "true",
    "yes",
}

_HAAR_DETECTOR = cv2.CascadeClassifier(
    str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml")
)


def _detect_with_haar(image: Image.Image) -> list[tuple[int, int, int, int]]:
    gray = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2GRAY)
    scale = min(1.0, 900 / max(gray.shape[:2]))
    if scale < 1.0:
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    boxes = _HAAR_DETECTOR.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(40, 40),
    )

    if scale == 1.0:
        return [(int(x), int(y), int(width), int(height)) for x, y, width, height in boxes]

    inverse_scale = 1 / scale
    return [
        (
            int(x * inverse_scale),
            int(y * inverse_scale),
            int(width * inverse_scale),
            int(height * inverse_scale),
        )
        for x, y, width, height in boxes
    ]


def _detect_with_mtcnn(image: Image.Image) -> list[tuple[int, int, int, int]]:
    from facenet_pytorch import MTCNN

    detector = MTCNN(
        image_size=160,
        margin=20,
        keep_all=True,
        post_process=False,
    )
    boxes, probabilities = detector.detect(image)
    if boxes is None:
        return []

    faces = []
    for box, probability in zip(boxes, probabilities):
        if probability is None or probability < 0.90:
            continue
        x1, y1, x2, y2 = box
        faces.append((int(x1), int(y1), int(x2 - x1), int(y2 - y1)))
    return faces


def detect_faces(
    file_path: str,
) -> list[tuple[int, int, int, int]]:

    path = Path(file_path)

    if not path.exists():
        raise ValueError("Image file does not exist.")

    image = Image.open(path).convert("RGB")

    if USE_MTCNN:
        return _detect_with_mtcnn(image)
    return _detect_with_haar(image)


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
