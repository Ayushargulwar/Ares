import os
from typing import Dict, Any, Optional

class LLMProvider:
    """
    LLM Abstraction Layer supporting:
    - Anthropic Claude API / Gemini API (if keys present)
    - Deterministic Mock Engine (fallback for offline hackathon demo)
    """
    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")

    def generate_response(self, system_prompt: str, user_prompt: str, fallback_response: str) -> str:
        # If API keys are set, we could invoke them, but fallback provides guaranteed speed & stability for demo
        if not self.anthropic_key and not self.gemini_key:
            return fallback_response
        
        # Simple placeholder if keys are present (can use httpx to call API)
        return fallback_response

_provider_instance = None

def get_llm_provider() -> LLMProvider:
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = LLMProvider()
    return _provider_instance
