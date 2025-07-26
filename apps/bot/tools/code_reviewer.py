"""Validate and apply self-generated code updates."""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


def _syntax_ok(path: Path) -> bool:
    result = subprocess.run(["python", "-m", "py_compile", str(path)], capture_output=True, text=True)
    if result.returncode == 0:
        return True
    print(result.stderr)
    return False


def _apply_diff(target: Path, diff_file: Path, output: Path) -> bool:
    cmd = ["patch", str(target), "-i", str(diff_file), "-o", str(output)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr)
        return False
    return True


def review_update(proposal: Path, target: Path, run_tests: bool = False) -> bool:
    """Validate the proposed update and if valid, replace the target file."""
    tmp_path = target.with_suffix(target.suffix + ".tmp")
    success = False
    try:
        if proposal.suffix == ".diff":
            if not _apply_diff(target, proposal, tmp_path):
                return False
        else:
            shutil.copy(proposal, tmp_path)
        if not _syntax_ok(tmp_path):
            return False
        if run_tests:
            test_res = subprocess.run(["pytest", "-q"], capture_output=True, text=True)
            if test_res.returncode != 0:
                print(test_res.stdout)
                print(test_res.stderr)
                return False
        tmp_path.replace(target)
        success = True
    finally:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
    return success
