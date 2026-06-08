import os

# ─── Three-level Socratic hint prompts ─────────────────────────────────── #

HINT_1_SYSTEM = """You are an expert algorithms tutor. You give a single, broad Socratic question.

RULES:
- Ask ONE open-ended question about what repeated work the student's approach does.
- Do NOT name any algorithm, data structure, or technique.
- Do NOT write code, pseudocode, or step-by-step instructions.
- Keep your response under 80 words.
- Be direct. No filler like 'Great question!' or 'Let me help you.'
"""

HINT_2_SYSTEM = """You are an expert algorithms tutor giving a second-level hint.

RULES:
- Point toward the key structural insight without naming the optimal approach.
- You may mention the *type* of operation that could help (e.g., "lookup", "partition", "cache") but NOT the specific data structure.
- Do NOT write code or pseudocode.
- Keep your response under 100 words.
"""

HINT_3_SYSTEM = """You are an expert algorithms tutor giving a final, most-specific hint.

RULES:
- Give the most pointed Socratic question possible without fully revealing the answer.
- You may reference the general category of data structure (e.g., "a structure with O(1) average lookup") but NOT name it directly.
- Do NOT write code or pseudocode.
- Do NOT confirm or deny if the student guesses.
- Keep your response under 100 words.
"""

# Progressive fallback hints when no API key is configured.
FALLBACK_HINTS = [
    "What repeated work does your solution perform as the input grows, and can any result be remembered instead of rediscovered?",
    "Consider whether you truly need to compare every pair. Is there a way to know instantly if a complement exists?",
    "Think about a structure that answers 'have I seen this value before?' in constant time. How would that reduce your nested work?",
]


def _build_user_prompt(hint_number: int, problem_statement: str,
                       user_complexity: str | None, optimal_complexity: str | None,
                       status: str, error_message: str | None) -> str:
    return f"""Problem:
{problem_statement}

Submission status: {status}
User complexity: {user_complexity or 'unknown'}
Optimal complexity: {optimal_complexity or 'unknown'}
Failure: {error_message or 'none'}

This is hint #{hint_number} of 3 the student has requested.
Ask one Socratic question that helps the student notice the complexity gap without revealing the technique."""


def generate_hint(hint_number: int, problem_statement: str,
                  user_complexity: str | None, optimal_complexity: str | None,
                  status: str, error_message: str | None) -> str:
    """Generate a single hint (non-streaming). Returns the hint text."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key.startswith("sk-ant-your-key"):
        idx = max(0, min(hint_number - 1, len(FALLBACK_HINTS) - 1))
        return FALLBACK_HINTS[idx]

    system_prompts = {1: HINT_1_SYSTEM, 2: HINT_2_SYSTEM, 3: HINT_3_SYSTEM}
    system = system_prompts.get(hint_number, HINT_1_SYSTEM)
    user_msg = _build_user_prompt(hint_number, problem_statement,
                                  user_complexity, optimal_complexity,
                                  status, error_message)

    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=300,
        system=system,
        messages=[{"role": "user", "content": user_msg}],
    )
    return response.content[0].text
