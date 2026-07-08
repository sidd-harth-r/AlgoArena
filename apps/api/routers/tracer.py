"""
Visual Code Tracing router.

POST /tracer/trace — Accepts user code + optional stdin, runs it through
the sys.settrace instrumentor locally, returns recursion tree + loop trace.
"""

import json
import os
import subprocess
import sys
import tempfile

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Path to the trace instrumentor script
INSTRUMENTOR_PATH = os.path.join(os.path.dirname(__file__), "..", "services", "trace_instrumentor.py")


class TraceRequest(BaseModel):
    code: str
    stdin: str = ""


def parse_trace_output(stdout: str) -> list[dict]:
    """Extract the JSON trace from between sentinel markers."""
    if "###TRACE_START###" not in stdout:
        return []
    raw = stdout.split("###TRACE_START###", 1)[1].split("###TRACE_END###", 1)[0].strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return []


def build_recursion_tree(events: list[dict]) -> dict | None:
    """Nests call events by parent_id into a tree for the frontend."""
    nodes = {}
    root = None
    for e in events:
        if e["type"] == "call":
            nodes[e["call_id"]] = {
                "call_id": e["call_id"], "func": e["func"], "args": e["args"],
                "line": e["line"], "children": [], "return_value": None,
            }
            if e["parent_id"] is None:
                root = nodes[e["call_id"]]
            elif e["parent_id"] in nodes:
                nodes[e["parent_id"]]["children"].append(nodes[e["call_id"]])
        elif e["type"] == "return" and e["call_id"] in nodes:
            nodes[e["call_id"]]["return_value"] = e["return_value"]
    return root


def build_loop_trace(events: list[dict]) -> list[dict]:
    """Flat per-line variable snapshots for a step-through timeline view."""
    return [
        {"step": e["step"], "line": e["line"], "func": e["func"], "locals": e["locals"]}
        for e in events if e["type"] == "line"
    ]


@router.post("/trace")
async def trace_code(req: TraceRequest):
    """Run user code through the sys.settrace instrumentor and return trace data."""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="No code provided")

    # Write user code to a temp file
    code_file = None
    stdin_file = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as f:
            f.write(req.code)
            code_file = f.name

        cmd = [sys.executable, os.path.abspath(INSTRUMENTOR_PATH), code_file]

        # If stdin is provided, write it to a temp file and pass as arg
        if req.stdin.strip():
            with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8") as f:
                f.write(req.stdin)
                stdin_file = f.name
            cmd.append(stdin_file)

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=10,
        )

        stdout = result.stdout
        stderr = result.stderr

        events = parse_trace_output(stdout)

        if not events:
            return {
                "status": "error",
                "detail": {"message": stderr or "No trace output produced. Check your code for issues."},
                "recursion_tree": None,
                "loop_trace": [],
                "total_steps": 0,
            }

        # Check for error events
        if events[0].get("type") in ("syntax_error", "trace_limit"):
            return {
                "status": "error",
                "detail": events[0],
                "recursion_tree": None,
                "loop_trace": [],
                "total_steps": 0,
            }

        return {
            "status": "ok",
            "recursion_tree": build_recursion_tree(events),
            "loop_trace": build_loop_trace(events),
            "total_steps": len(events),
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "detail": {"message": "Code execution timed out (10s limit). Check for infinite loops or deep recursion."},
            "recursion_tree": None,
            "loop_trace": [],
            "total_steps": 0,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Tracing failed: {exc}")
    finally:
        for path in [code_file, stdin_file]:
            if path:
                try:
                    os.unlink(path)
                except OSError:
                    pass
