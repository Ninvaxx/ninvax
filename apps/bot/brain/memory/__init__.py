from pathlib import Path
import json

MEMORY_PATH = Path(__file__).with_name("memory_log.json")


def load_memory() -> dict:
    if MEMORY_PATH.exists():
        return json.loads(MEMORY_PATH.read_text())
    return {}


def update_memory(entry: dict) -> None:
    data = load_memory()
    data.update(entry)
    MEMORY_PATH.write_text(json.dumps(data, indent=2))

