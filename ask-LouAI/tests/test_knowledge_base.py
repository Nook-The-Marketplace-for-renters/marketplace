from app.knowledge_base import build_knowledge_base

LISTING = {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Sunny loft near the park",
    "address": "123 Main St",
    "neighbourhood": "Riverside",
    "type": "Loft",
    "unit_size": "1 bed / 1 bath",
    "baths": 1,
    "sqft": 650,
    "price_monthly": 2200,
    "rating": 4.5,
    "reviews": 12,
    "tags": ["Pet friendly", "In-unit laundry"],
    "available": "Sept 1",
    "description": "A bright loft with big windows and a private balcony.",
    "pet_policy": "Cats and small dogs welcome.",
    "lease_term": "12 months",
}

ALL_FIELDS = {
    "greeting",
    "farewell",
    "title",
    "location",
    "type_and_size",
    "sqft",
    "price",
    "availability",
    "pet_policy",
    "lease_term",
    "tags",
    "rating",
    "description",
}


def test_build_knowledge_base_covers_every_populated_field():
    chunks = build_knowledge_base(LISTING)
    fields = {chunk.field for chunk in chunks}

    assert fields == ALL_FIELDS


def test_build_knowledge_base_expands_every_question_phrasing_per_field():
    chunks = build_knowledge_base(LISTING)
    location_questions = {c.question for c in chunks if c.field == "location"}

    # data/knowledge_base.csv lists 4 phrasings for "location" — every one
    # should become its own chunk (same answer, different question).
    assert len(location_questions) == 4
    location_answers = {c.answer for c in chunks if c.field == "location"}
    assert location_answers == {"It's located at 123 Main St, in the Riverside neighbourhood."}


def test_build_knowledge_base_skips_optional_fields_that_are_missing():
    sparse_listing = {**LISTING, "pet_policy": "", "lease_term": "", "tags": [], "reviews": 0, "sqft": None}
    chunks = build_knowledge_base(sparse_listing)
    fields = {chunk.field for chunk in chunks}

    assert fields == ALL_FIELDS - {"pet_policy", "lease_term", "tags", "rating", "sqft"}


def test_pet_policy_answer_fills_in_the_raw_policy_text():
    chunks = build_knowledge_base(LISTING)
    pet_chunk = next(c for c in chunks if c.field == "pet_policy")

    assert pet_chunk.answer == "Pet policy: Cats and small dogs welcome."


def test_greeting_and_farewell_are_listing_independent_small_talk():
    # Unlike every other field, greeting/farewell don't reference any
    # listing data, so they should show up even for a listing missing every
    # optional field, and every phrasing should share one canned answer.
    sparse_listing = {**LISTING, "pet_policy": "", "lease_term": "", "tags": [], "reviews": 0, "sqft": None}
    chunks = build_knowledge_base(sparse_listing)

    greeting_questions = {c.question for c in chunks if c.field == "greeting"}
    assert "Hi" in greeting_questions
    assert "Hello" in greeting_questions
    greeting_answers = {c.answer for c in chunks if c.field == "greeting"}
    assert len(greeting_answers) == 1

    farewell_questions = {c.question for c in chunks if c.field == "farewell"}
    assert "Thanks" in farewell_questions
