"""Emotion Reflector module.

Analyzes text and returns mood scores with reflection prompts."""

from typing import Dict


def analyze_text(text: str) -> Dict[str, float]:
    """Return simple mood scores for the supplied text."""
    mood = {
        "happy": text.lower().count("good"),
        "sad": text.lower().count("bad"),
    }
    total = sum(mood.values()) or 1
    return {k: v / total for k, v in mood.items()}


def reflection_prompt(mood_scores: Dict[str, float]) -> str:
    """Generate a short reflection prompt based on mood."""
    if mood_scores.get("happy", 0) > mood_scores.get("sad", 0):
        return "What made you feel positive today?"
    return "What challenges did you face today?"
