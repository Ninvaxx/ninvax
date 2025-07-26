from __future__ import annotations

"""Plugin to fetch GitHub issues."""

from typing import List, Dict, Any
from urllib.parse import urlparse
import requests


def fetch(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fetch open issues from a GitHub repository."""
    repo = config.get("repo")
    if not repo:
        return []
    if repo.startswith("http"):
        parsed = urlparse(repo)
        repo = parsed.path.strip("/")
    url = f"https://api.github.com/repos/{repo}/issues"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as exc:
        print(f"github_issues: failed to fetch {url}: {exc}")
        return []
    issues = []
    for issue in resp.json():
        if issue.get("pull_request"):
            continue
        issues.append(
            {
                "id": issue.get("number"),
                "title": issue.get("title"),
                "url": issue.get("html_url"),
                "created_at": issue.get("created_at"),
                "body": issue.get("body", ""),
            }
        )
    return issues
