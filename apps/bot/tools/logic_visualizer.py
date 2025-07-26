from __future__ import annotations

"""Visualize planning logic using Graphviz."""

from pathlib import Path
from typing import Dict, Any

try:
    from graphviz import Digraph
except Exception:  # pragma: no cover - optional dependency
    Digraph = None


def visualize(plan: Dict[str, Any], out_dir: Path) -> Path | None:
    """Render a simple flow diagram for the plan."""
    if Digraph is None:
        print("graphviz is not available; skipping visualization")
        return None
    out_dir.mkdir(parents=True, exist_ok=True)
    dot = Digraph(comment="Plan")
    dot.node("start", "start")
    content = str(plan.get("content", "")).splitlines()
    prev = "start"
    for i, line in enumerate(content, 1):
        node_id = f"step{i}"
        dot.node(node_id, line[:40])
        dot.edge(prev, node_id)
        prev = node_id
    out_file = out_dir / "plan.svg"
    dot.format = "svg"
    dot.render(out_file.with_suffix(""), cleanup=True)
    return out_file
