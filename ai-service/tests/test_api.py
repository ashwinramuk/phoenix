"""API tests. The Claude calls are stubbed so these run offline with no key.

The routes call `llm.explain_answer` / `llm.generate_question` through the module
(`from app import llm`), so monkeypatching `app.llm.<fn>` swaps them out.
"""
import pytest
from fastapi.testclient import TestClient

from app import llm
from app.main import app
from app.models import (
    DistractorNote,
    Explanation,
    GeneratedQuestion,
    Options,
)

client = TestClient(app)

EXPLAIN_PAYLOAD = {
    "question": "What is Newton's second law?",
    "options": {"A": "F=ma", "B": "E=mc^2", "C": "PV=nRT", "D": "F=mg"},
    "correct_answer": "A",
    "user_answer": "B",
    "subject": "Physics",
}


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "model" in body


def test_explain_returns_structured_explanation(monkeypatch):
    def fake_explain(req):
        assert req.correct_answer == "A"  # request was parsed into the model
        return Explanation(
            explanation="Force equals mass times acceleration.",
            key_concept="Newton's second law of motion",
            distractor_notes=[DistractorNote(option="B", why_wrong="mass-energy equivalence")],
        )

    monkeypatch.setattr(llm, "explain_answer", fake_explain)

    r = client.post("/explain", json=EXPLAIN_PAYLOAD)
    assert r.status_code == 200
    body = r.json()
    assert body["key_concept"] == "Newton's second law of motion"
    assert body["distractor_notes"][0]["option"] == "B"


def test_generate_returns_structured_question(monkeypatch):
    def fake_generate(req):
        assert req.topic == "Thermodynamics"
        return GeneratedQuestion(
            question="First law of thermodynamics is a statement of?",
            options=Options(A="Energy conservation", B="Entropy", C="Enthalpy", D="Work"),
            answer="A",
            explanation="It conserves energy.",
        )

    monkeypatch.setattr(llm, "generate_question", fake_generate)

    r = client.post(
        "/generate-question",
        json={"topic": "Thermodynamics", "difficulty": "easy", "subject": "Physics"},
    )
    assert r.status_code == 200
    assert r.json()["answer"] == "A"


def test_explain_rejects_invalid_choice():
    bad = {**EXPLAIN_PAYLOAD, "correct_answer": "E"}
    r = client.post("/explain", json=bad)
    assert r.status_code == 422  # FastAPI validation error


def test_explain_returns_503_without_api_key(monkeypatch):
    # Real llm.explain_answer raises RuntimeError when no key is configured.
    def no_key(req):
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    monkeypatch.setattr(llm, "explain_answer", no_key)
    r = client.post("/explain", json=EXPLAIN_PAYLOAD)
    assert r.status_code == 503
