"""Runtime configuration, read from the environment.

Kept tiny and dependency-free so the rest of the app (and the tests) can import
it without pulling in the Anthropic SDK.
"""
import os
from functools import lru_cache


class Settings:
    def __init__(self) -> None:
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
        # Default to the most capable model. Override with PHOENIX_AI_MODEL
        # (e.g. claude-haiku-4-5) if you want to trade quality for cost.
        self.model: str = os.getenv("PHOENIX_AI_MODEL", "claude-opus-4-8")
        self.max_tokens: int = int(os.getenv("PHOENIX_AI_MAX_TOKENS", "2048"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
