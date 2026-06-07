import os

SYSTEM_PROMPT = """You are an expert algorithms tutor at a top CS university.
You give terse, precise, Socratic feedback.

ABSOLUTE RULES (never break these):
- Never name the optimal algorithm, data structure, or technique.
- Never write code, pseudocode, or step-by-step instructions.
- Never confirm or deny if the student guesses the algorithm.
- Keep your entire response under 150 words.
- Be direct. Do not use filler words like 'Great question!'
"""


def build_hint_context(sub, problem_statement: str) -> str:
    return f"""Problem:
{problem_statement}

Submission status: {sub.status.value}
Passed tests: {sub.passed_count}/{sub.total_count}
User complexity: {sub.user_complexity.value if sub.user_complexity else 'unknown'}
Optimal complexity: {sub.optimal_complexity.value if sub.optimal_complexity else 'unknown'}
Failure: {sub.error_message or 'none'}

Ask one Socratic question that helps the student notice the complexity gap without revealing the technique."""


def stream_hint(sub, problem_statement: str):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key.startswith("sk-ant-your-key"):
        yield "What repeated work does your solution perform as the input grows, and can any result be remembered instead of rediscovered?"
        return

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    user_msg = build_hint_context(sub, problem_statement)
    with client.messages.stream(model="claude-haiku-4-5", max_tokens=400, system=SYSTEM_PROMPT, messages=[{"role": "user", "content": user_msg}]) as stream:
        for text in stream.text_stream:
            yield text
