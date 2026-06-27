"""Pydantic request/response models.

The response models (Explanation, GeneratedQuestion) double as the schema for
Claude's structured outputs, so they avoid features the structured-output
JSON-schema doesn't support — notably free-form `dict` fields (which need
`additionalProperties`). Options are modelled as a fixed A/B/C/D object and the
answer as a Literal enum.
"""
from typing import Literal, Optional

from pydantic import BaseModel, Field

Choice = Literal["A", "B", "C", "D"]
Difficulty = Literal["easy", "medium", "hard"]


class Options(BaseModel):
    A: str
    B: str
    C: str
    D: str


# ---- /explain ---------------------------------------------------------------


class ExplainRequest(BaseModel):
    question: str = Field(min_length=1)
    options: Options
    correct_answer: Choice
    user_answer: Optional[Choice] = None
    subject: Optional[str] = None


class DistractorNote(BaseModel):
    option: Choice
    why_wrong: str


class Explanation(BaseModel):
    explanation: str
    key_concept: str
    distractor_notes: list[DistractorNote]


# ---- /generate-question -----------------------------------------------------


class GenerateRequest(BaseModel):
    topic: str = Field(min_length=1)
    difficulty: Difficulty = "medium"
    subject: Optional[str] = None


class GeneratedQuestion(BaseModel):
    question: str
    options: Options
    answer: Choice
    explanation: str
