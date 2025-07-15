"""Run Python unit tests on generated files."""

from pathlib import Path
import subprocess
import sys
import shutil
from typing import Optional

from brain.memory import update_memory


def run_tests(target: Path) -> bool:
    """Execute unit tests using pytest if available, otherwise unittest."""
    if not target.exists():
        print(f"No file found to test: {target}")
        return False

    command: Optional[list] = None
    if shutil.which("pytest"):
        command = ["pytest", "-q", str(target)]
    else:
        command = [sys.executable, "-m", "unittest", str(target)]

    print(f"Running tests with: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    success = result.returncode == 0

    if success:
        print("Tests passed.")
        update_memory({str(target): "tests_passed"})
    else:
        print("Tests failed.")
        print(result.stdout)
        print(result.stderr)
    return success

