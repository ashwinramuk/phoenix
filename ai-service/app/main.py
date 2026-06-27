"""Phoenix AI service — FastAPI app.

A small LLM-powered companion to the Phoenix exam platform:
  POST /explain            — explain why a question's answer is correct
  POST /generate-question  — generate a fresh practice MCQ on a topic
"""
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import llm
from app.config import get_settings
from app.models import (
    Explanation,
    ExplainRequest,
    GeneratedQuestion,
    GenerateRequest,
)

app = FastAPI(title="Phoenix AI Service", version="0.1.0")

# Allow the Next.js frontend (localhost:3000 by default) to call us from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("PHOENIX_AI_CORS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "model": settings.model,
        "llm_configured": bool(settings.anthropic_api_key),
    }


@app.post("/explain", response_model=Explanation)
def explain(req: ExplainRequest) -> Explanation:
    try:
        return llm.explain_answer(req)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@app.post("/generate-question", response_model=GeneratedQuestion)
def generate(req: GenerateRequest) -> GeneratedQuestion:
    try:
        return llm.generate_question(req)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
