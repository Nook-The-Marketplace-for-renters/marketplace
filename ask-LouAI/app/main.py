from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import AskRequest, AskResponse, Match
from .search import build_answer, semantic_search
from .supabase_client import ListingNotFoundError

app = FastAPI(
    title="ask-LouAI",
    description="Semantic search chatbot over a single marketplace listing's data.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest) -> AskResponse:
    try:
        matches = await semantic_search(
            payload.listing_id,
            payload.question,
            payload.top_k,
            force_refresh=payload.refresh,
        )
    except ListingNotFoundError:
        raise HTTPException(status_code=404, detail=f"No listing found with id {payload.listing_id!r}.")

    answer, confident = build_answer(matches)
    return AskResponse(
        listing_id=payload.listing_id,
        question=payload.question,
        answer=answer,
        confident=confident,
        matches=[Match(field=m.field, text=m.text, score=m.score) for m in matches],
    )
