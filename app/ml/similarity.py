import numpy as np


def cosine_similarity(
    embedding_a: list[float],
    embedding_b: list[float],
) -> float:

    vector_a = np.asarray(
        embedding_a,
        dtype=np.float32,
    )

    vector_b = np.asarray(
        embedding_b,
        dtype=np.float32,
    )

    if vector_a.shape != vector_b.shape:
        raise ValueError(
            "Embeddings must have the same dimensions."
        )

    norm_a = np.linalg.norm(
        vector_a
    )

    norm_b = np.linalg.norm(
        vector_b
    )

    if norm_a == 0 or norm_b == 0:
        raise ValueError(
            "Cannot compare zero-length embeddings."
        )

    similarity = float(
        np.dot(
            vector_a,
            vector_b,
        )
        / (norm_a * norm_b)
    )

    return similarity


def similarity_percentage(
    embedding_a: list[float],
    embedding_b: list[float],
) -> float:

    similarity = cosine_similarity(
        embedding_a,
        embedding_b,
    )

    similarity = max(
        0.0,
        min(1.0, similarity),
    )

    return round(
        similarity * 100,
        2,
    )