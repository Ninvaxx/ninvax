"""Tool to write code to disk."""

from pathlib import Path


def write_file(path: str, content: str) -> None:
    """Write content to a file.

    Args:
        path: File path to write to.
        content: Text content to write.
    """
    print(f"Writing to {path} ...")
    Path(path).write_text(content)
