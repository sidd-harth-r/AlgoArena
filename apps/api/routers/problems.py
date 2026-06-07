from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from models.database import get_db
from models.models import Difficulty, Problem

router = APIRouter()


def problem_summary(problem: Problem):
    return {
        "id": problem.id,
        "title": problem.title,
        "slug": problem.slug,
        "difficulty": problem.difficulty.value,
        "topic_tags": problem.topic_tags,
        "optimal_complexity": problem.optimal_complexity.value,
    }


@router.get("/")
def list_problems(difficulty: str | None = Query(default=None), topic: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(Problem).filter(Problem.is_published.is_(True))
    if difficulty:
        query = query.filter(Problem.difficulty == Difficulty(difficulty))
    problems = query.order_by(Problem.id.asc()).all()
    if topic:
        problems = [p for p in problems if topic in (p.topic_tags or [])]
    return [problem_summary(p) for p in problems]


@router.get("/{slug}")
def get_problem(slug: str, db: Session = Depends(get_db)):
    problem = (
        db.query(Problem)
        .options(selectinload(Problem.test_cases))
        .filter(Problem.slug == slug, Problem.is_published.is_(True))
        .first()
    )
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    visible_cases = [tc for tc in problem.test_cases if not tc.is_hidden]
    return {
        **problem_summary(problem),
        "statement_md": problem.statement_md,
        "editorial_md": problem.editorial_md,
        "time_limit_ms": problem.time_limit_ms,
        "memory_limit_mb": problem.memory_limit_mb,
        "examples": [{"input": tc.input_data, "expected": tc.expected_out, "display_order": tc.display_order} for tc in sorted(visible_cases, key=lambda tc: tc.display_order)],
    }
