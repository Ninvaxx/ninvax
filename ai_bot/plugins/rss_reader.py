from __future__ import annotations

"""Plugin to read RSS feeds and store headlines."""

from typing import List, Dict, Any
from datetime import datetime

try:
    import feedparser  # type: ignore
except Exception:  # pragma: no cover - optional
    feedparser = None

from ai_bot.brain.embeddings.vector_store import get_vector_store


def fetch(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fetch latest entries from an RSS feed and store them in vector memory."""
    if feedparser is None:
        print("rss_reader: feedparser not available")
        return []
    url = config.get("url")
    if not url:
        return []
    feed = feedparser.parse(url)
    store = get_vector_store()
    entries = []
    for entry in feed.entries:
        item = {
            "title": entry.get("title", ""),
            "link": entry.get("link", ""),
            "published": entry.get("published", ""),
        }
        entries.append(item)
        text = f"{item['title']} {item['link']}"
        store.add(
            text,
            {
                "source": url,
                "timestamp": datetime.utcnow().isoformat(),
                "type": "rss",
            },
        )
    return entries
