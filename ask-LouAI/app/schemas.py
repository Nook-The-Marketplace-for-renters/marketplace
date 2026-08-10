from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    listing_id: str = Field(..., description="UUID of the listing (posting) being asked about")
    question: str = Field(..., min_length=1, max_length=2000)
    top_k: int = Field(default=3, ge=1, le=10)
    refresh: bool = Field(
        default=False,
        description="Force-reload this listing's knowledge base from Supabase before answering",
    )


class Match(BaseModel):
    field: str
    text: str
    score: float


class AskResponse(BaseModel):
    listing_id: str
    question: str
    answer: str
    confident: bool
    matches: list[Match]
