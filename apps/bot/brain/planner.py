"""Planning logic for the AI bot."""

from typing import Any, Optional, Dict

from bot.brain.embeddings.vector_store import get_vector_store
from bot.tools.self_review import summarize_thoughts


def _is_testable(content: str) -> bool:
    """Very small heuristic to determine if code has testable functions."""
    return "def " in content

def plan(data: str, question: Optional[str] = None, config: Optional[Dict[str, Any]] = None) -> Any:
    """Simulate planning based on scraped data.

    Args:
        data: Raw data from an input module.

    Returns:
        dict: A simple plan describing the next action.
    """
    config = config or {}
    enable_recursive = config.get("enable_recursive_planning", False)
    context = ""
    if enable_recursive:
        store = get_vector_store()
        docs = store.query(question or data)
        if docs:
            context = "\n".join(d.get("text", "") for d in docs)
        review = summarize_thoughts()
        if review:
            context = f"{context}\n{review}" if context else review

    print("Planning next steps ...")
    combined = f"{data}\n\n{context}" if context else data
    # In a real implementation this would contain actual planning logic.
    content = combined.upper()
    return {
        "action": "write_code",
        "content": content,
        "testable": _is_testable(content),
    }

