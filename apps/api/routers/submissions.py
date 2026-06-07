import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, selectinload

from models.database import SessionLocal, get_db
from models.models import Problem, Submission, SubmissionStatus
from routers.users import DEMO_USER_ID, ensure_demo_user
from services.complexity import complexity_rank, infer_complexity
from services.judge import submit_to_judge0

router = APIRouter()


class SubmitRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "python"


def serialize_submission(sub: Submission):
    return {
        "id": str(sub.id),
        "status": sub.status.value,
        "passed_count": sub.passed_count,
        "total_count": sub.total_count,
        "runtime_ms": sub.runtime_ms,
        "memory_kb": sub.memory_kb,
        "error_message": sub.error_message,
        "failed_input": sub.failed_input,
        "expected_output": sub.expected_output,
        "actual_output": sub.actual_output,
        "user_complexity": sub.user_complexity.value if sub.user_complexity else None,
        "optimal_complexity": sub.optimal_complexity.value if sub.optimal_complexity else None,
        "is_optimal": sub.is_optimal,
    }


@router.post("/")
async def create_submission(req: SubmitRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    problem = db.query(Problem).options(selectinload(Problem.test_cases)).filter(Problem.id == req.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    ensure_demo_user(db)
    sub = Submission(id=uuid.uuid4(), problem_id=req.problem_id, user_id=DEMO_USER_ID, code=req.code, language=req.language, status=SubmissionStatus.PENDING, total_count=len(problem.test_cases), optimal_complexity=problem.optimal_complexity)
    db.add(sub)
    db.commit()
    background_tasks.add_task(evaluate_submission, str(sub.id))
    return {"submission_id": str(sub.id), "status": "PENDING"}


@router.get("/{submission_id}")
def get_submission(submission_id: str, db: Session = Depends(get_db)):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return serialize_submission(sub)


async def evaluate_submission(submission_id: str):
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            return
        problem = db.query(Problem).options(selectinload(Problem.test_cases)).filter(Problem.id == sub.problem_id).first()
        sub.status = SubmissionStatus.RUNNING
        db.commit()

        # Run complexity analysis first (works without Judge0)
        try:
            sub.user_complexity = infer_complexity(sub.code) if sub.language == "python" else None
            sub.is_optimal = complexity_rank(sub.user_complexity) <= complexity_rank(sub.optimal_complexity)
        except Exception as exc:
            sub.user_complexity = None
            sub.is_optimal = None
            sub.error_message = f"Complexity analysis unavailable: {exc}"

        passed = 0
        runtime_total = 0
        memory_max = 0
        final_status = SubmissionStatus.ACCEPTED
        for case in sorted(problem.test_cases, key=lambda tc: tc.display_order):
            try:
                result = await submit_to_judge0(sub.code, sub.language, case.input_data, problem.time_limit_ms)
            except Exception as exc:
                final_status = SubmissionStatus.INTERNAL_ERROR
                sub.error_message = f"Judge0 unavailable: {exc}"
                break
            status_id = result.get("status", {}).get("id")
            stdout = (result.get("stdout") or "").strip()
            expected = case.expected_out.strip()
            runtime_total += int(float(result.get("time") or 0) * 1000)
            memory_max = max(memory_max, int(result.get("memory") or 0))
            mapped = map_judge_status(status_id, stdout, expected)
            if mapped == SubmissionStatus.ACCEPTED:
                passed += 1
                continue
            final_status = mapped
            sub.failed_input = case.input_data
            sub.expected_output = expected
            sub.actual_output = stdout
            sub.error_message = result.get("stderr") or result.get("compile_output") or result.get("message")
            break

        sub.passed_count = passed
        sub.runtime_ms = runtime_total
        sub.memory_kb = memory_max
        sub.status = final_status
        db.commit()
    except Exception as exc:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if sub:
            sub.status = SubmissionStatus.INTERNAL_ERROR
            sub.error_message = str(exc)
            db.commit()
    finally:
        db.close()


def map_judge_status(status_id: int | None, stdout: str, expected: str) -> SubmissionStatus:
    if status_id == 3 and stdout == expected:
        return SubmissionStatus.ACCEPTED
    if status_id == 3:
        return SubmissionStatus.WRONG_ANSWER
    if status_id in {4, 5}:
        return SubmissionStatus.TIME_LIMIT
    if status_id == 6:
        return SubmissionStatus.COMPILE_ERROR
    if status_id in {7, 8, 9, 10, 11, 12}:
        return SubmissionStatus.RUNTIME_ERROR
    return SubmissionStatus.INTERNAL_ERROR
