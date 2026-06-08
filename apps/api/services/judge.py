"""Local code judge that runs Python solutions via subprocess.

This replaces Judge0 when it's unavailable (e.g., Docker Desktop on Windows
doesn't support cgroups v1 needed by Judge0). It executes the user's code
in a subprocess with a timeout, captures stdout, and returns a result
dict matching the Judge0 response format.
"""

import subprocess
import sys
import tempfile
import time
import os


async def submit_to_judge0(code: str, language: str, stdin: str, time_limit_ms: int):
    """Run code locally. Falls back from Judge0 which requires Linux cgroups."""
    # Local execution (Python only — the primary language for AlgoArena)
    if language == "python":
        return _run_locally(code, stdin, time_limit_ms)

    return {
        "status": {"id": 13, "description": "Internal Error"},
        "stdout": None,
        "stderr": "Local execution only supports Python.",
        "time": "0",
        "memory": 0,
    }


async def _submit_judge0_remote(code: str, language: str, stdin: str, time_limit_ms: int, judge0_url: str):
    """Original Judge0 HTTP submission."""
    import base64
    import httpx

    JUDGE0_RAPIDAPI_KEY = os.getenv("JUDGE0_RAPIDAPI_KEY")
    LANGUAGE_IDS = {"python": 71, "javascript": 63, "cpp": 54}

    lang_id = LANGUAGE_IDS.get(language, 71)
    payload = {
        "source_code": base64.b64encode(code.encode()).decode(),
        "language_id": lang_id,
        "stdin": base64.b64encode(stdin.encode()).decode(),
        "cpu_time_limit": time_limit_ms / 1000,
        "encode_source": True,
        "encode_stdin": True,
    }
    headers = {}
    if JUDGE0_RAPIDAPI_KEY:
        headers = {"X-RapidAPI-Key": JUDGE0_RAPIDAPI_KEY, "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"}
    async with httpx.AsyncClient(headers=headers) as client:
        resp = await client.post(f"{judge0_url}/submissions?wait=true", json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # Check if Judge0 returned an internal error (cgroup issues, etc.)
        status_id = data.get("status", {}).get("id")
        if status_id == 13:
            raise RuntimeError("Judge0 internal error - falling back to local")
        for field in ["stdout", "stderr", "compile_output", "message"]:
            if data.get(field):
                try:
                    data[field] = base64.b64decode(data[field]).decode(errors="replace")
                except Exception:
                    pass
        return data


def _run_locally(code: str, stdin: str, time_limit_ms: int) -> dict:
    """Run Python code in a subprocess and return Judge0-compatible result."""
    timeout_sec = max(time_limit_ms / 1000, 1)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(code)
        tmp_path = f.name

    try:
        start = time.perf_counter()
        result = subprocess.run(
            [sys.executable, tmp_path],
            input=stdin,
            capture_output=True,
            text=True,
            timeout=timeout_sec,
        )
        elapsed = time.perf_counter() - start

        if result.returncode == 0:
            return {
                "status": {"id": 3, "description": "Accepted"},
                "stdout": result.stdout,
                "stderr": result.stderr or None,
                "time": str(round(elapsed, 4)),
                "memory": 0,
            }
        else:
            return {
                "status": {"id": 11, "description": "Runtime Error (NZEC)"},
                "stdout": result.stdout or None,
                "stderr": result.stderr or None,
                "time": str(round(elapsed, 4)),
                "memory": 0,
            }

    except subprocess.TimeoutExpired:
        return {
            "status": {"id": 5, "description": "Time Limit Exceeded"},
            "stdout": None,
            "stderr": None,
            "time": str(timeout_sec),
            "memory": 0,
        }
    except Exception as exc:
        return {
            "status": {"id": 13, "description": "Internal Error"},
            "stdout": None,
            "stderr": str(exc),
            "time": "0",
            "memory": 0,
        }
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
