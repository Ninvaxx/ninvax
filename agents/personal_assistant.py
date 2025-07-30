"""Personal Assistant pipeline powered by GPT-4.

Combines scheduling, journaling and media curation tasks."""

from typing import List


def run_assistant_flow(goals: List[str]) -> str:
    """Return a placeholder response summarizing assistant actions."""
    summary = "; ".join(goals)
    return f"Assistant planned tasks: {summary}"
