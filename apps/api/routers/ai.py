from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import HintUsage, Problem, Submission, SubmissionStatus
from services.ai_tutor import stream_hint

router = APIRouter()
MAX_HINTS = 3


@router.get("/hint/{submission_id}")
def get_hint(submission_id: str, db: Session = Depends(get_db)):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.is_optimal and sub.status == SubmissionStatus.ACCEPTED:
        return {"skip": True, "message": "Solution is already optimal!"}

    usage = db.query(HintUsage).filter_by(user_id=sub.user_id, problem_id=sub.problem_id).first()
    if not usage:
        usage = HintUsage(user_id=sub.user_id, problem_id=sub.problem_id, hint_count=0)
        db.add(usage)
    if usage.hint_count >= MAX_HINTS:
        raise HTTPException(status_code=429, detail=f"Hint limit ({MAX_HINTS}) reached")

    usage.hint_count += 1
    usage.last_hint_at = datetime.utcnow()
    db.commit()
    problem = db.query(Problem).filter(Problem.id == sub.problem_id).first()

    def generate():
        for text in stream_hint(sub, problem.statement_md, usage.hint_count):
            yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
