from __future__ import annotations
"""Query multiple LLM providers and combine their answers."""

import os
from typing import List

# Optional imports for various providers
try:
    import openai  # type: ignore
except Exception:
    openai = None

try:
    import anthropic  # type: ignore
except Exception:
    anthropic = None

try:
    import cohere  # type: ignore
except Exception:
    cohere = None

try:
    import google.generativeai as genai  # type: ignore
except Exception:
    genai = None


def _call_openai(question: str) -> str:
    """Call OpenAI's chat completion API."""
    if openai is None:
        return ""
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return ""
    openai.api_key = key
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": question}],
        )
        return resp["choices"][0]["message"]["content"].strip()
    except Exception:
        return ""


def _call_claude(question: str) -> str:
    """Call Anthropic Claude API."""
    if anthropic is None:
        return ""
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return ""
    client = anthropic.Anthropic(api_key=key)
    try:
        msg = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=512,
            messages=[{"role": "user", "content": question}],
        )
        return msg.content[0].text.strip()
    except Exception:
        return ""


def _call_cohere(question: str) -> str:
    """Call Cohere generate API."""
    if cohere is None:
        return ""
    key = os.getenv("COHERE_API_KEY")
    if not key:
        return ""
    client = cohere.Client(key)
    try:
        resp = client.generate(prompt=question, max_tokens=300)
        return resp.generations[0].text.strip()
    except Exception:
        return ""


def _call_gemini(question: str) -> str:
    """Call Google's Gemini API."""
    if genai is None:
        return ""
    key = os.getenv("GOOGLE_API_KEY")
    if not key:
        return ""
    genai.configure(api_key=key)
    try:
        model = genai.GenerativeModel("gemini-pro")
        resp = model.generate_content(question)
        return resp.text.strip()
    except Exception:
        return ""


PROVIDERS = [_call_openai, _call_claude, _call_gemini, _call_cohere]


def ask_ensemble(question: str) -> str:
    """Ask all providers and combine their answers via majority vote."""
    answers: List[str] = []
    for provider in PROVIDERS:
        answer = provider(question)
        if answer:
            answers.append(answer)
    if not answers:
        return "No response available."
    # Simple majority vote: return answer with highest frequency
    from collections import Counter

    counter = Counter(answers)
    top_answer, _ = counter.most_common(1)[0]
    if len(counter) == 1:
        return top_answer
    # If multiple answers differ, ask OpenAI to consolidate if available
    if openai is not None and os.getenv("OPENAI_API_KEY"):
        prompt = (
            "Given the following answers from different AI models, produce a final"
            " coherent response that best represents a consensus.\n" +
            "\n".join(f"- {a}" for a in answers)
        )
        final = _call_openai(prompt)
        return final or top_answer
    return top_answer
