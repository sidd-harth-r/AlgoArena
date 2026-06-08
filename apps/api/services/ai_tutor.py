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

def get_fallback_hint(hint_number: int, problem_statement: str) -> str:
    statement_lower = problem_statement.lower()
    
    if "array" in statement_lower and ("sum" in statement_lower or "target" in statement_lower):
        hints = [
            "What repeated work does your solution perform as the input array grows? Can any result be remembered instead of rediscovered?",
            "Consider whether you truly need to compare every pair. Is there a way to know instantly if a complement exists?",
            "Think about a structure that answers 'have I seen this value before?' in constant time. How would that reduce your nested work?"
        ]
    elif "string" in statement_lower or "palindrome" in statement_lower or "substring" in statement_lower:
        hints = [
            "What redundant comparisons are you making when checking the string? Can you reuse previous checks?",
            "Consider how you might expand from the center or use a sliding window to avoid re-evaluating the same characters.",
            "Think about whether storing the frequencies or positions of characters could help you skip unnecessary work."
        ]
    elif "tree" in statement_lower or "node" in statement_lower or "graph" in statement_lower:
        hints = [
            "Are you visiting the same nodes multiple times? What traversal method fits this problem best?",
            "Consider whether you need a depth-first or breadth-first approach. What information needs to be passed down or up the tree/graph?",
            "Think about how recursion or a queue/stack could simplify the tracking of your current state."
        ]
    else:
        # Extract a short context from the first line for a generic but tailored feel
        lines = [line.strip() for line in problem_statement.strip().split('\n') if line.strip() and not line.startswith('#')]
        context = lines[0][:40] + "..." if lines else "this problem"
        hints = [
            f"Regarding '{context}': What is the core bottleneck in your approach? Consider what repeated calculations can be cached or avoided.",
            f"For '{context}', think about the constraints. Could an auxiliary data structure (like a hash map, set, or heap) help optimize the bottleneck?",
            f"Is there a different algorithmic paradigm (such as binary search, two pointers, or dynamic programming) that fits '{context}' better?"
        ]
        
    idx = max(0, min(hint_number - 1, len(hints) - 1))
    return hints[idx]


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
        return get_fallback_hint(hint_number, problem_statement)

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
