import time
from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .config import settings
from .embeddings import encode
from .knowledge_base import KnowledgeChunk, build_knowledge_base
from .supabase_client import fetch_listing


@dataclass
class _CachedIndex:
    chunks: List[KnowledgeChunk]
    vectors: np.ndarray
    loaded_at: float


@dataclass
class ScoredChunk:
    field: str
    text: str
    score: float


# In-memory knowledge base, one entry per listing_id. Rebuilt from Supabase
# whenever it's missing, stale, or a caller passes refresh=True.
_cache: Dict[str, _CachedIndex] = {}


async def load_knowledge_base(listing_id: str, *, force_refresh: bool = False) -> _CachedIndex:
    cached = _cache.get(listing_id)
    now = time.monotonic()
    if cached and not force_refresh and (now - cached.loaded_at) < settings.kb_cache_ttl_seconds:
        return cached

    listing = await fetch_listing(listing_id)
    chunks = build_knowledge_base(listing)
    vectors = encode([chunk.question for chunk in chunks]) if chunks else np.empty((0, 0), dtype=np.float32)

    index = _CachedIndex(chunks=chunks, vectors=vectors, loaded_at=now)
    _cache[listing_id] = index
    return index


async def semantic_search(
    listing_id: str,
    question: str,
    top_k: int = 3,
    *,
    force_refresh: bool = False,
) -> List[ScoredChunk]:
    """Rank this listing's FAQ chunks against `question`.

    Matches are deduped by field (best-scoring phrasing wins) so the same
    fact isn't returned twice just because it has several canonical
    question phrasings in data/knowledge_base.csv.
    """
    index = await load_knowledge_base(listing_id, force_refresh=force_refresh)
    if not index.chunks:
        return []

    [question_vector] = encode([question])
    scores = cosine_similarity(index.vectors, question_vector.reshape(1, -1)).ravel()
    ranked_indices = np.argsort(-scores)

    results: List[ScoredChunk] = []
    seen_fields = set()
    for i in ranked_indices:
        chunk = index.chunks[i]
        if chunk.field in seen_fields:
            continue
        seen_fields.add(chunk.field)
        results.append(ScoredChunk(field=chunk.field, text=chunk.answer, score=float(scores[i])))
        if len(results) >= top_k:
            break

    return results


def build_answer(matches: List[ScoredChunk]) -> Tuple[str, bool]:
    """Turn the top semantic-search match into a chatbot-style answer.

    No generative LLM involved: the "answer" is the best-matching fact
    from the listing's own knowledge base.
    """
    if not matches:
        return "This posting doesn't have enough information loaded yet to answer that.", False

    top = matches[0]
    if top.score < settings.min_confidence:
        return f"I'm not fully sure, but the closest match I found is: {top.text}", False

    return top.text, True
