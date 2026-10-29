from functools import lru_cache

import numpy as np
import torch
from PIL import Image
from facenet_pytorch import InceptionResnetV1


@lru_cache(maxsize=1)
def get_embedding_model():
    model = InceptionResnetV1(
        pretrained="vggface2"
    ).eval()

    return model


def prepare_face(face_bgr: np.ndarray) -> torch.Tensor:
    if face_bgr is None or face_bgr.size == 0:
        raise ValueError("Invalid face image.")

    face_rgb = face_bgr[:, :, ::-1]

    image = Image.fromarray(face_rgb)

    image = image.resize((160, 160))

    image_array = np.asarray(
        image
    ).astype(np.float32)

    image_array = (
        image_array - 127.5
    ) / 128.0

    tensor = torch.from_numpy(
        image_array
    )

    tensor = tensor.permute(
        2,
        0,
        1,
    )

    tensor = tensor.unsqueeze(0)

    return tensor


def generate_face_embedding(
    face_bgr: np.ndarray,
) -> list[float]:

    tensor = prepare_face(
        face_bgr
    )

    model = get_embedding_model()

    with torch.no_grad():
        embedding = model(tensor)

    embedding = (
        embedding
        .cpu()
        .numpy()[0]
    )

    norm = np.linalg.norm(
        embedding
    )

    if norm == 0:
        raise ValueError(
            "Face embedding normalization failed."
        )

    embedding = (
        embedding / norm
    )

    return embedding.astype(
        np.float32
    ).tolist()