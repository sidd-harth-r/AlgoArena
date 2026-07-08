"""
trace_instrumentor.py

Runs as a standalone script via subprocess. Executes the user's Python code
under sys.settrace, recording call/line/return events. Emits a JSON trace
between sentinel markers so stdout parsing stays clean.

Usage:
    python trace_instrumentor.py <path_to_user_code_file> [stdin_file]

The backend writes the user's source to a temp file and invokes this script.
"""

import sys
import json
import types

MAX_STEPS = 2000          # hard cap on total trace events
MAX_DEPTH = 60            # hard cap on call stack depth
MAX_VAR_LEN = 200         # truncate long repr()s

USER_CODE_FILENAME = "<user_code>"

_events = []
_step = 0
_call_stack = []          # stack of call_ids
_call_id_counter = 0


def safe_repr(value):
    try:
        r = repr(value)
        # If it's a default object repr like <__main__.TreeNode object at 0x...>
        if r.startswith("<") and " object at " in r:
            cls_name = value.__class__.__name__
            attrs = []
            for k, v in getattr(value, "__dict__", {}).items():
                if not k.startswith("_") and v is not None:
                    if isinstance(v, (int, float, str, bool)):
                        attrs.append(f"{k}={repr(v)}")
                        if len(attrs) >= 2: break
            if attrs:
                r = f"{cls_name}({', '.join(attrs)})"
            else:
                r = f"{cls_name} Obj"
    except Exception:
        r = "<unrepresentable>"
    if len(r) > MAX_VAR_LEN:
        r = r[:MAX_VAR_LEN] + "...(truncated)"
    return r


def snapshot_locals(frame):
    snap = {}
    for k, v in frame.f_locals.items():
        if k.startswith("__") or isinstance(v, (types.ModuleType, types.FunctionType)):
            continue
        snap[k] = safe_repr(v)
    return snap


class TraceLimitExceeded(Exception):
    pass


def tracer(frame, event, arg):
    global _step, _call_id_counter

    if frame.f_code.co_filename != USER_CODE_FILENAME:
        return None  # skip stdlib / instrumentor internals
        
    if frame.f_code.co_name == "__init__":
        return None  # skip tracing object initializers

    if _step >= MAX_STEPS:
        raise TraceLimitExceeded("step limit exceeded")

    if event == "call":
        if len(_call_stack) >= MAX_DEPTH:
            raise TraceLimitExceeded("recursion depth limit exceeded")
        _call_id_counter += 1
        call_id = _call_id_counter
        parent_id = _call_stack[-1] if _call_stack else None
        _call_stack.append(call_id)
        _events.append({
            "step": _step, "type": "call", "call_id": call_id,
            "parent_id": parent_id, "func": frame.f_code.co_name,
            "line": frame.f_lineno, "args": snapshot_locals(frame),
        })
        _step += 1
        return tracer

    if event == "line":
        _events.append({
            "step": _step, "type": "line",
            "call_id": _call_stack[-1] if _call_stack else None,
            "func": frame.f_code.co_name, "line": frame.f_lineno,
            "locals": snapshot_locals(frame),
        })
        _step += 1
        return tracer

    if event == "return":
        call_id = _call_stack.pop() if _call_stack else None
        _events.append({
            "step": _step, "type": "return", "call_id": call_id,
            "func": frame.f_code.co_name, "line": frame.f_lineno,
            "return_value": safe_repr(arg),
        })
        _step += 1
        return tracer

    return tracer


def main():
    global USER_CODE_FILENAME

    if len(sys.argv) < 2:
        print(json.dumps({"error": "no source file provided"}))
        return

    src_path = sys.argv[1]
    with open(src_path) as f:
        source = f.read()

    # Optional stdin file
    if len(sys.argv) >= 3:
        stdin_path = sys.argv[2]
        sys.stdin = open(stdin_path)

    # Recompile against a fixed pseudo-filename so the tracer's identity
    # check (co_filename == USER_CODE_FILENAME) works regardless of the
    # real temp path.
    try:
        compiled = compile(source, USER_CODE_FILENAME, "exec")
    except SyntaxError as e:
        print("###TRACE_START###")
        print(json.dumps([{"step": 0, "type": "syntax_error", "message": str(e), "line": e.lineno}]))
        print("###TRACE_END###")
        return

    sys.settrace(tracer)
    try:
        exec(compiled, {"__name__": "__main__", "__builtins__": __builtins__})
    except TraceLimitExceeded as e:
        _events.append({"step": _step, "type": "trace_limit", "message": str(e)})
    except Exception as e:
        _events.append({"step": _step, "type": "runtime_error", "message": f"{type(e).__name__}: {e}"})
    finally:
        sys.settrace(None)

    print("###TRACE_START###")
    print(json.dumps(_events))
    print("###TRACE_END###")


if __name__ == "__main__":
    main()
