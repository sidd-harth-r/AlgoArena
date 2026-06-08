from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import HintUsage, Problem, Submission, SubmissionStatus
from services.ai_tutor import generate_hint

router = APIRouter()
MAX_HINTS = 3


@router.get("/hint/{problem_id}/{hint_number}")
def get_hint(problem_id: int, hint_number: int, db: Session = Depends(get_db)):
    """Fetch a specific hint (1, 2, or 3) for a problem.

    Returns JSON: { hint_number, text, hints_revealed }
    """
    if hint_number < 1 or hint_number > MAX_HINTS:
        raise HTTPException(status_code=400, detail="hint_number must be 1, 2, or 3")

    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Find the latest submission for context (optional — hints work without one)
    from routers.users import DEMO_USER_ID
    sub = (
        db.query(Submission)
        .filter(Submission.problem_id == problem_id, Submission.user_id == DEMO_USER_ID)
        .order_by(Submission.created_at.desc())
        .first()
    )

    # Enforce sequential reveal via HintUsage
    usage = db.query(HintUsage).filter_by(user_id=DEMO_USER_ID, problem_id=problem_id).first()
    if not usage:
        usage = HintUsage(user_id=DEMO_USER_ID, problem_id=problem_id, hint_count=0)
        db.add(usage)
        db.flush()

    # Must reveal hints in order: can't get hint 2 without hint 1
    if hint_number > usage.hint_count + 1:
        raise HTTPException(
            status_code=400,
            detail=f"Must reveal hint {usage.hint_count + 1} first"
        )

    # If already revealed, just re-generate (idempotent)
    if hint_number <= usage.hint_count:
        text = generate_hint(
            hint_number=hint_number,
            problem_statement=problem.statement_md,
            user_complexity=sub.user_complexity.value if sub and sub.user_complexity else None,
            optimal_complexity=problem.optimal_complexity.value if problem.optimal_complexity else None,
            status=sub.status.value if sub else "no submission",
            error_message=sub.error_message if sub else None,
        )
        return {"hint_number": hint_number, "text": text, "hints_revealed": usage.hint_count}

    # New hint — increment usage
    usage.hint_count = hint_number
    usage.last_hint_at = datetime.utcnow()
    db.commit()

    text = generate_hint(
        hint_number=hint_number,
        problem_statement=problem.statement_md,
        user_complexity=sub.user_complexity.value if sub and sub.user_complexity else None,
        optimal_complexity=problem.optimal_complexity.value if problem.optimal_complexity else None,
        status=sub.status.value if sub else "no submission",
        error_message=sub.error_message if sub else None,
    )

    return {"hint_number": hint_number, "text": text, "hints_revealed": usage.hint_count}
