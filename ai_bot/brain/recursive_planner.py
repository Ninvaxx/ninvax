"""Self-referential planning utilities for the AI bot."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

try:
    import openai  # type: ignore
except Exception:  # pragma: no cover - optional
    openai = None

from ai_bot.brain.memory import MEMORY_PATH, load_memory
from ai_bot.brain.thoughts import THOUGHTS_DIR
from ai_bot.brain.embeddings.vector_store import STORE_PATH

BASE_DIR = Path(__file__).parent
PROPOSAL_DIFF = BASE_DIR / "proposed_update.diff"
PROPOSAL_PY = BASE_DIR / "proposed_update.py"


def call_llm(prompt: str) -> str:
    """Send a prompt to OpenAI or return a placeholder string."""
    if openai is None:
        print("OpenAI package not available; returning placeholder response.")
        return ""
    resp = openai.Completion.create(engine="text-davinci-003", prompt=prompt, max_tokens=1500)
    return resp["choices"][0]["text"]


def summarize_thoughts(limit: int = 5) -> str:
    files = sorted(THOUGHTS_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)[:limit]
    lines = []
    for path in files:
        text = path.read_text().splitlines()
        first = text[0] if text else ""
        lines.append(f"{path.name}: {first}")
    return "\n".join(lines)


def propose_self_update() -> Optional[Path]:
    """Generate a diff or new module proposing self-modifications."""
    memory = load_memory()
    thoughts_summary = summarize_thoughts()
    vector_info = ""
    if STORE_PATH.exists():
        try:
            items = json.loads(STORE_PATH.read_text())
            vector_info = f"Vector store size: {len(items)}"
        except Exception:
            vector_info = "Vector store could not be read"
    prompt = (
        "You are a code improving agent.\n"
        f"Memory: {json.dumps(memory, indent=2)}\n"
        f"Recent thoughts:\n{thoughts_summary}\n"
        f"{vector_info}\n"
        "Propose improvements to planner.py, code_writer.py or recursive_planner.py. "
        "Return a unified diff or the full replacement code prefixed with '# target: <path>'."
    )
    result = call_llm(prompt)
    if not result.strip():
        return None
    if result.lstrip().startswith("diff"):
        PROPOSAL_DIFF.write_text(result)
        return PROPOSAL_DIFF
    PROPOSAL_PY.write_text(result)
    return PROPOSAL_PY
