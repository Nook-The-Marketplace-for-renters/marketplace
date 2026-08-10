from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from .config import settings


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """Load the local embedding model once per process."""
    return SentenceTransformer(settings.embedding_model)


def encode(texts: list[str]) -> np.ndarray:
    """Embed a batch of strings as L2-normalized vectors.

    Vectors are normalized so cosine similarity reduces to a plain dot
    product when comparing them later.
    """
    model = get_model()
    return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
