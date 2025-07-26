"""Analyze past thoughts to provide feedback for the planner."""

from pathlib import Path
from typing import List

from bot.brain.thoughts import THOUGHTS_DIR


def summarize_thoughts(limit: int = 5) -> str:
    """Return a naive summary of recent thought files."""
    files: List[Path] = sorted(
        THOUGHTS_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True
    )[:limit]
    summaries = []
    for path in files:
        text = path.read_text().strip()
        first_line = text.splitlines()[0] if text else ""
        summaries.append(f"{path.name}: {first_line}")
    return "\n".join(summaries)
