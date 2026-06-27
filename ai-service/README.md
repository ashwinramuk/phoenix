# Phoenix AI Service

A small LLM-powered companion to the Phoenix exam platform — **Python · FastAPI · Pydantic · Claude**.

It turns the question bank into something interactive:

| Endpoint | Does |
|---|---|
| `GET /health` | Liveness + whether the LLM is configured |
| `POST /explain` | Explains *why* a question's answer is correct (and why the others are wrong) |
| `POST /generate-question` | Generates a fresh practice MCQ on a topic |

Both LLM endpoints return **structured, schema-validated output** — Claude is asked
via `client.messages.parse(...)` to fill a Pydantic model, so responses are typed,
not free text.

## Stack

- **FastAPI** for the HTTP layer
- **Pydantic v2** for request validation and the LLM output schema
- **Anthropic Python SDK** (`claude-opus-4-8` by default) for structured generation

## Run

```bash
cd phoenix/ai-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
cp .env.example .env        # add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 4100
```

Then:

```bash
curl localhost:4100/health

curl -X POST localhost:4100/explain -H "Content-Type: application/json" -d '{
  "question": "What is Newton'\''s second law?",
  "options": {"A": "F=ma", "B": "E=mc^2", "C": "PV=nRT", "D": "F=mg"},
  "correct_answer": "A",
  "subject": "Physics"
}'
```

## Test

Tests stub the Claude calls, so they run **offline with no API key**:

```bash
pip install -e ".[dev]"
pytest
```

- `tests/test_models.py` — Pydantic validation (parametrized)
- `tests/test_api.py` — endpoints with the LLM mocked

## Config

| Env var | Default | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required for the LLM endpoints; without it they return 503 |
| `PHOENIX_AI_MODEL` | `claude-opus-4-8` | Set to `claude-haiku-4-5` to trade quality for cost |
| `PHOENIX_AI_MAX_TOKENS` | `2048` | |
