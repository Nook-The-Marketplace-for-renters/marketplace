from app.search import ScoredChunk, build_answer


def test_build_answer_returns_top_match_when_confident():
    matches = [
        ScoredChunk(field="pet_policy", text="Pet policy: cats welcome.", score=0.8),
        ScoredChunk(field="description", text="A bright loft.", score=0.2),
    ]

    answer, confident = build_answer(matches)

    assert answer == "Pet policy: cats welcome."
    assert confident is True


def test_build_answer_flags_low_confidence_matches():
    matches = [ScoredChunk(field="description", text="A bright loft.", score=0.1)]

    answer, confident = build_answer(matches)

    assert "A bright loft." in answer
    assert confident is False


def test_build_answer_handles_no_matches():
    answer, confident = build_answer([])

    assert confident is False
    assert "enough information" in answer
