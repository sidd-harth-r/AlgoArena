"""
AI Code Mentor router.

POST /mentor/{submission_id}/chat  — Stream mentor feedback via SSE
GET  /mentor/{submission_id}/history — Return full conversation history
"""

import json
import os
import textwrap
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import MentorMessage, Problem, Submission
from routers.users import DEMO_USER_ID

router = APIRouter()

MENTOR_SYSTEM_PROMPT = """You are a DAA (Design and Analysis of Algorithms) coding mentor.
You are given a student's code, the problem statement, and their test case results.
Identify concrete flaws: syntax mistakes, logical errors, and minor issues (off-by-one,
wrong comparison operator, uninitialized variable, etc).

Rules:
- Point to specific lines/conditions, don't just say "there's a bug".
- Prefer guiding questions over handing over corrected code outright, unless the
  student explicitly asks for the fix.
- If the code passes all visible tests, comment on complexity/edge cases instead
  of inventing problems.
- Be concise. No filler, no repeating the problem statement back at them.
- Use markdown formatting for code snippets and emphasis.
"""


class ChatRequest(BaseModel):
    message: str


def build_mentor_context(submission: Submission, problem: Problem) -> str:
    """Build a context string from the submission and problem for the LLM."""
    return textwrap.dedent(f"""
        PROBLEM: {problem.title}
        {problem.statement_md}

        STUDENT CODE ({submission.language}):
        ```python
        {submission.code}
        ```

        SUBMISSION STATUS: {submission.status.value}
        TESTS PASSED: {submission.passed_count}/{submission.total_count}
        ERROR: {submission.error_message or 'None'}
        USER COMPLEXITY: {submission.user_complexity.value if submission.user_complexity else 'unknown'}
        OPTIMAL COMPLEXITY: {submission.optimal_complexity.value if submission.optimal_complexity else 'unknown'}
    """)


@router.post("/{submission_id}/chat")
async def mentor_chat(submission_id: str, req: ChatRequest, db: Session = Depends(get_db)):
    """Stream AI mentor response for a submission via SSE."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    problem = db.query(Problem).filter(Problem.id == submission.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Save the user's message
    db.add(MentorMessage(
        submission_id=submission.id,
        role="user",
        content=req.message,
        created_at=datetime.utcnow(),
    ))
    db.commit()

    # Build conversation history
    history = (
        db.query(MentorMessage)
        .filter(MentorMessage.submission_id == submission.id)
        .order_by(MentorMessage.created_at)
        .all()
    )

    context = build_mentor_context(submission, problem)
    messages = [{"role": "user", "content": context}]
    for h in history:
        messages.append({"role": h.role, "content": h.content})

    from dotenv import load_dotenv
    load_dotenv(override=True)
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key.startswith("gsk_your_key"):
        # Fallback when no API key is configured
        fallback_text = _generate_fallback_mentor_response(submission, req.message)
        db.add(MentorMessage(
            submission_id=submission.id,
            role="assistant",
            content=fallback_text,
            created_at=datetime.utcnow(),
        ))
        db.commit()

        async def fallback_stream():
            # Send the entire fallback as one chunk
            yield f"data: {json.dumps({'token': fallback_text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(fallback_stream(), media_type="text/event-stream")

    from groq import Groq
    client = Groq(api_key=api_key)

    def event_stream():
        full_reply = ""
        try:
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                max_tokens=1024,
                messages=[{"role": "system", "content": MENTOR_SYSTEM_PROMPT}] + messages,
                stream=True,
            )
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    full_reply += content
                    yield f"data: {json.dumps({'token': content})}\n\n"

            # Save the full assistant reply
            db_session = db
            db_session.add(MentorMessage(
                submission_id=submission.id,
                role="assistant",
                content=full_reply,
                created_at=datetime.utcnow(),
            ))
            db_session.commit()
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/{submission_id}/history")
def mentor_history(submission_id: str, db: Session = Depends(get_db)):
    """Return full conversation history for a submission."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    history = (
        db.query(MentorMessage)
        .filter(MentorMessage.submission_id == submission.id)
        .order_by(MentorMessage.created_at)
        .all()
    )

    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        }
        for msg in history
    ]


def _generate_fallback_mentor_response(submission: Submission, user_message: str) -> str:
    """Generate a basic mentor response when no LLM API key is configured."""
    msg_lower = user_message.lower()
    status = submission.status.value

    if status == "ACCEPTED":
        return (
            "Your solution is **accepted** — all test cases pass! 🎉\n\n"
            f"Your complexity is **{submission.user_complexity.value if submission.user_complexity else 'unknown'}** "
            f"vs the target of **{submission.optimal_complexity.value if submission.optimal_complexity else 'unknown'}**.\n\n"
            "Consider:\n"
            "- Are there edge cases (empty input, single element, duplicates) that might break the solution?\n"
            "- Could you achieve a better time/space complexity?\n"
            "- Is your code readable and well-structured?"
        )
    elif status == "WRONG_ANSWER":
        return (
            "Your solution produces a **wrong answer**.\n\n"
            f"**{submission.passed_count}/{submission.total_count}** test cases passed.\n\n"
            "Common causes of wrong answers:\n"
            "1. **Off-by-one errors** — check your loop bounds and index access\n"
            "2. **Wrong comparison operator** — `<` vs `<=`, `==` vs `!=`\n"
            "3. **Missing edge cases** — empty input, single element, negative numbers\n"
            "4. **Incorrect output format** — check if whitespace or newlines matter\n\n"
            "Try tracing through the failing test case manually to find the discrepancy."
        )
    elif "TIME_LIMIT" in status:
        return (
            "Your solution exceeds the **time limit**.\n\n"
            f"Detected complexity: **{submission.user_complexity.value if submission.user_complexity else 'unknown'}**\n"
            f"Target complexity: **{submission.optimal_complexity.value if submission.optimal_complexity else 'unknown'}**\n\n"
            "Consider:\n"
            "- Can you reduce nested loops?\n"
            "- Would a hash map/set eliminate redundant lookups?\n"
            "- Is there a divide-and-conquer or dynamic programming approach?"
        )
    elif "RUNTIME_ERROR" in status:
        error_msg = submission.error_message or "No error details available"
        return (
            f"Your solution has a **runtime error**:\n\n```\n{error_msg}\n```\n\n"
            "Common causes:\n"
            "- **IndexError** — accessing list/array out of bounds\n"
            "- **ValueError** — incorrect type conversions\n"
            "- **RecursionError** — missing or wrong base case in recursion\n"
            "- **ZeroDivisionError** — dividing by zero without a guard"
        )
    else:
        return (
            f"Your submission has status: **{status}**.\n\n"
            f"Error: {submission.error_message or 'None'}\n\n"
            "Can you share more about what you're trying to do? I can help identify specific issues in your code."
        )
