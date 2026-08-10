from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

import pandas as pd

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "knowledge_base.csv"


@dataclass(frozen=True)
class KnowledgeChunk:
    """One FAQ-style fact about a listing.

    `question` is a canonical phrasing (from data/knowledge_base.csv) used
    for semantic matching against what the client actually typed. `answer`
    is that row's answer_template with {field} placeholders filled in from
    the posting's own data.
    """

    field: str
    question: str
    answer: str


def _load_templates() -> pd.DataFrame:
    return pd.read_csv(DATA_FILE, dtype=str, keep_default_na=False)


_TEMPLATES = _load_templates()


def _template_context(listing: dict) -> Dict[str, str]:
    context = dict(listing)
    context["tags"] = ", ".join(listing.get("tags") or [])
    return context


def build_knowledge_base(listing: dict) -> List[KnowledgeChunk]:
    """Turn a Supabase `listings` row into FAQ chunks driven by the CSV.

    Editing data/knowledge_base.csv (adding question phrasings or new
    field/answer rows) changes what LouAI knows how to answer — no Python
    changes required.
    """
    context = _template_context(listing)
    chunks: List[KnowledgeChunk] = []

    for row in _TEMPLATES.itertuples(index=False):
        required = [f.strip() for f in row.requires.split(",") if f.strip()]
        if any(not listing.get(field) for field in required):
            continue

        try:
            answer = row.answer_template.format(**context)
        except (KeyError, IndexError):
            continue

        for question in row.questions.split("|"):
            question = question.strip()
            if question:
                chunks.append(KnowledgeChunk(field=row.field, question=question, answer=answer))

    return chunks
