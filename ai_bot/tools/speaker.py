from __future__ import annotations

"""Simple text-to-speech helper."""

from typing import Optional, Dict

try:
    import pyttsx3  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    pyttsx3 = None

_DEF_CONFIG = {"rate": 150}


def speak(text: str, config: Optional[Dict[str, any]] = None) -> None:
    """Speak the provided text if TTS is available."""
    config = {**_DEF_CONFIG, **(config or {})}
    if pyttsx3 is None:
        print(f"[speak] {text}")
        return
    engine = pyttsx3.init()
    if "rate" in config:
        engine.setProperty("rate", config["rate"])
    if "voice" in config:
        engine.setProperty("voice", config["voice"])
    engine.say(text)
    engine.runAndWait()
