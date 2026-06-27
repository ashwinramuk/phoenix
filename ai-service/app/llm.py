"""Claude-backed logic for the AI service.

Each function builds a prompt and asks Claude for a *structured* response,
validated against a Pydantic model via `client.messages.parse(...)`. The
Anthropic SDK is imported lazily inside `_client()` so the rest of the app —
and the unit tests, which stub these functions — don't need the SDK installed.
"""
from app.config import get_settings
from app.models import (
    DistractorNote,
    Explanation,
    ExplainRequest,
    GeneratedQuestion,
    GenerateRequest,
    Options,
)

_DEMO_PREFIX = "[Demo — set ANTHROPIC_API_KEY for live AI] "


def _client():
    settings = get_settings()
    if not settings.anthropic_api_key:
        # Surfaced by the routes as HTTP 503 — the service runs, but the LLM
        # endpoints need a key.
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    import anthropic  # lazy: keeps the SDK out of the import path for tests

    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def _demo_explanation(req: ExplainRequest) -> Explanation:
    correct_text = getattr(req.options, req.correct_answer)
    others = [c for c in ("A", "B", "C", "D") if c != req.correct_answer]
    return Explanation(
        explanation=(
            f"{_DEMO_PREFIX}The correct answer is {req.correct_answer}: "
            f"\"{correct_text}\". This placeholder is returned without calling "
            "Claude; add an API key to get a real explanation."
        ),
        key_concept="(demo) the concept this question tests",
        distractor_notes=[
            DistractorNote(option=o, why_wrong="(demo) reason this option is incorrect")
            for o in others
        ],
    )


def _demo_question(req: GenerateRequest) -> GeneratedQuestion:
    return GeneratedQuestion(
        question=f"{_DEMO_PREFIX}Sample {req.difficulty} question on {req.topic}?",
        options=Options(A="Option A", B="Option B", C="Option C", D="Option D"),
        answer="A",
        explanation="(demo) placeholder explanation — add an API key for live generation.",
    )


def explain_answer(req: ExplainRequest) -> Explanation:
    settings = get_settings()
    if not settings.anthropic_api_key:
        return _demo_explanation(req)
    client = _client()

    chose = f" The student chose {req.user_answer}." if req.user_answer else ""
    prompt = (
        "You are a patient tutor for Indian government-exam aspirants.\n"
        f"Subject: {req.subject or 'General'}\n\n"
        f"Question: {req.question}\n"
        f"A. {req.options.A}\n"
        f"B. {req.options.B}\n"
        f"C. {req.options.C}\n"
        f"D. {req.options.D}\n\n"
        f"The correct answer is {req.correct_answer}.{chose}\n\n"
        "Explain why the correct answer is right, name the single key concept "
        "being tested, and for each incorrect option give a one-line reason it "
        "is wrong."
    )

    response = client.messages.parse(
        model=settings.model,
        max_tokens=settings.max_tokens,
        messages=[{"role": "user", "content": prompt}],
        output_format=Explanation,
    )
    return response.parsed_output


def generate_question(req: GenerateRequest) -> GeneratedQuestion:
    settings = get_settings()
    if not settings.anthropic_api_key:
        return _demo_question(req)
    client = _client()

    prompt = (
        "Write one original multiple-choice practice question for an Indian "
        "government-exam aspirant.\n"
        f"Subject: {req.subject or 'General'}\n"
        f"Topic: {req.topic}\n"
        f"Difficulty: {req.difficulty}\n\n"
        "Provide four options (A-D) with exactly one correct answer and a short "
        "explanation of why it is correct."
    )

    response = client.messages.parse(
        model=settings.model,
        max_tokens=settings.max_tokens,
        messages=[{"role": "user", "content": prompt}],
        output_format=GeneratedQuestion,
    )
    return response.parsed_output
