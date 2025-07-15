from pathlib import Path
from datetime import datetime

THOUGHTS_DIR = Path(__file__).parent
THOUGHTS_DIR.mkdir(exist_ok=True)

def log_thought(content: str, tag: str = "thought") -> None:
    """Save a thought or decision to a markdown file."""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{tag}_{timestamp}.md"
    (THOUGHTS_DIR / filename).write_text(content)

