"""Pure-logic tests for the Pydantic request models — no network, no API key."""
import pytest
from pydantic import ValidationError

from app.models import ExplainRequest, GenerateRequest


def make_explain(**overrides) -> dict:
    base = dict(
        question="What is Newton's second law?",
        options={"A": "F=ma", "B": "E=mc^2", "C": "PV=nRT", "D": "F=mg"},
        correct_answer="A",
    )
    base.update(overrides)
    return base


@pytest.mark.parametrize(
    "answer,valid",
    [("A", True), ("D", True), ("E", False), ("a", False), ("", False)],
)
def test_correct_answer_must_be_a_valid_choice(answer, valid):
    data = make_explain(correct_answer=answer)
    if valid:
        assert ExplainRequest(**data).correct_answer == answer
    else:
        with pytest.raises(ValidationError):
            ExplainRequest(**data)


def test_blank_question_is_rejected():
    with pytest.raises(ValidationError):
        ExplainRequest(**make_explain(question=""))


def test_user_answer_is_optional():
    req = ExplainRequest(**make_explain())
    assert req.user_answer is None


@pytest.mark.parametrize(
    "difficulty,valid",
    [("easy", True), ("medium", True), ("hard", True), ("expert", False)],
)
def test_generate_difficulty_validation(difficulty, valid):
    data = dict(topic="Thermodynamics", difficulty=difficulty)
    if valid:
        assert GenerateRequest(**data).difficulty == difficulty
    else:
        with pytest.raises(ValidationError):
            GenerateRequest(**data)


def test_generate_difficulty_defaults_to_medium():
    assert GenerateRequest(topic="Optics").difficulty == "medium"
