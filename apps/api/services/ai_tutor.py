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

# Progressive fallback hints when no API key is configured.
# Each level reveals a bit more without giving away the answer.
FALLBACK_HINTS = [
    "What repeated work does your solution perform as the input grows, and can any result be remembered instead of rediscovered?",
    "Consider whether you truly need to compare every pair. Is there a way to know instantly if a complement exists?",
    "Think about a structure that answers 'have I seen this value before?' in constant time. How would that reduce your nested work?",
]


def build_hint_context(sub, problem_statement: str, hint_number: int) -> str:
    return f"""Problem:
{problem_statement}

Submission status: {sub.status.value}
Passed tests: {sub.passed_count}/{sub.total_count}
User complexity: {sub.user_complexity.value if sub.user_complexity else 'unknown'}
Optimal complexity: {sub.optimal_complexity.value if sub.optimal_complexity else 'unknown'}
Failure: {sub.error_message or 'none'}

This is hint #{hint_number} of 3 the student has requested.
{'Give a broader, more abstract question.' if hint_number == 1 else ''}
{'Be slightly more specific than before, pointing toward the key insight.' if hint_number == 2 else ''}
{'Give the most pointed hint without revealing the answer.' if hint_number == 3 else ''}

Ask one Socratic question that helps the student notice the complexity gap without revealing the technique."""


def stream_hint(sub, problem_statement: str, hint_number: int = 1):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key.startswith("sk-ant-your-key"):
        # Use progressive fallback hints
        idx = max(0, min(hint_number - 1, len(FALLBACK_HINTS) - 1))
        yield FALLBACK_HINTS[idx]
        return

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    user_msg = build_hint_context(sub, problem_statement, hint_number)
    with client.messages.stream(model="claude-haiku-4-5", max_tokens=400, system=SYSTEM_PROMPT, messages=[{"role": "user", "content": user_msg}]) as stream:
        for text in stream.text_stream:
            yield text
