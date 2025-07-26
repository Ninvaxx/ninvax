from __future__ import annotations

"""Very small task scheduler."""

from datetime import datetime, timedelta
from typing import Dict, Any, List


class Scheduler:
    """Execute tasks based on simple intervals in seconds."""

    def __init__(self, tasks: Dict[str, Any]):
        self.tasks = []
        now = datetime.utcnow()
        for name, info in tasks.items():
            if not info.get("enabled", True):
                continue
            interval = int(info.get("interval", 60))
            self.tasks.append({"name": name, "interval": interval, "next": now})

    # ------------------------------------------------------------------
    def due(self) -> List[str]:
        now = datetime.utcnow()
        ready: List[str] = []
        for task in self.tasks:
            if now >= task["next"]:
                ready.append(task["name"])
                task["next"] = now + timedelta(seconds=task["interval"])
        return ready
