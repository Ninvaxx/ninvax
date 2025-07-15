"""Planning logic for the AI bot."""

from typing import Any


def _is_testable(content: str) -> bool:
    """Very small heuristic to determine if code has testable functions."""
    return "def " in content

def plan(data: str) -> Any:
    """Simulate planning based on scraped data.

    Args:
        data: Raw data from an input module.

    Returns:
        dict: A simple plan describing the next action.
    """
    print("Planning next steps ...")
    # In a real implementation this would contain actual planning logic.
    content = data.upper()
    return {
        "action": "write_code",
        "content": content,
        "testable": _is_testable(content),
    }

