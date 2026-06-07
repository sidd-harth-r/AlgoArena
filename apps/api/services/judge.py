import base64
import os

import httpx

JUDGE0_URL = os.getenv("JUDGE0_URL", "http://localhost:2358")
JUDGE0_RAPIDAPI_KEY = os.getenv("JUDGE0_RAPIDAPI_KEY")
LANGUAGE_IDS = {"python": 71, "javascript": 63, "cpp": 54}


async def submit_to_judge0(code: str, language: str, stdin: str, time_limit_ms: int):
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
        resp = await client.post(f"{JUDGE0_URL}/submissions?wait=true", json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        for field in ["stdout", "stderr", "compile_output", "message"]:
            if data.get(field):
                try:
                    data[field] = base64.b64decode(data[field]).decode(errors="replace")
                except Exception:
                    pass
        return data
