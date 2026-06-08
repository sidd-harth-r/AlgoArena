"""Virtual Contests router — create, manage, and score timed coding sessions."""

import random
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import Contest, ContestStatus, Difficulty, Problem, Submission, SubmissionStatus
from routers.users import DEMO_USER_ID, ensure_demo_user

router = APIRouter()


class CreateContestRequest(BaseModel):
    topics: list[str] = []
    duration_minutes: int = 60


@router.post("/")
def create_contest(req: CreateContestRequest, db: Session = Depends(get_db)):
    """Create a new contest. Selects 4 problems: 1 easy, 2 medium, 1 hard."""
    ensure_demo_user(db)

    if req.duration_minutes not in {30, 60, 90, 120}:
        raise HTTPException(status_code=400, detail="Duration must be 30, 60, 90, or 120 minutes")

    # Query problems filtered by topics
    query = db.query(Problem).filter(Problem.is_published.is_(True))
    all_problems = query.all()

    if req.topics:
        filtered = [p for p in all_problems if any(t in (p.topic_tags or []) for t in req.topics)]
    else:
        filtered = all_problems

    easy = [p for p in filtered if p.difficulty == Difficulty.EASY]
    medium = [p for p in filtered if p.difficulty == Difficulty.MEDIUM]
    hard = [p for p in filtered if p.difficulty == Difficulty.HARD]

    selected = []
    if easy:
        selected.extend(random.sample(easy, min(1, len(easy))))
    if medium:
        selected.extend(random.sample(medium, min(2, len(medium))))
    if hard:
        selected.extend(random.sample(hard, min(1, len(hard))))

    if len(selected) < 2:
        raise HTTPException(status_code=400, detail="Not enough problems available for these topics")

    problem_ids = [p.id for p in selected]

    contest = Contest(
        id=uuid.uuid4(),
        user_id=DEMO_USER_ID,
        status=ContestStatus.ACTIVE,
        duration_minutes=req.duration_minutes,
        topic_filter=req.topics,
        problem_ids=problem_ids,
        started_at=datetime.utcnow(),
    )
    db.add(contest)
    db.commit()

    ends_at = contest.started_at + timedelta(minutes=contest.duration_minutes)

    return {
        "contest_id": str(contest.id),
        "problem_ids": problem_ids,
        "duration_minutes": contest.duration_minutes,
        "started_at": contest.started_at.isoformat(),
        "ends_at": ends_at.isoformat(),
    }


@router.get("/")
def list_contests(db: Session = Depends(get_db)):
    """List all user's contests (newest first)."""
    ensure_demo_user(db)
    contests = (
        db.query(Contest)
        .filter(Contest.user_id == DEMO_USER_ID)
        .order_by(Contest.started_at.desc())
        .all()
    )
    return [_serialize_contest(c) for c in contests]


@router.get("/{contest_id}")
def get_contest(contest_id: str, db: Session = Depends(get_db)):
    """Get a specific contest with its problem details."""
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    # Auto-end expired contests
    _check_expired(contest, db)

    # Fetch problem details
    problems = db.query(Problem).filter(Problem.id.in_(contest.problem_ids)).all()
    problem_map = {p.id: p for p in problems}

    ends_at = contest.started_at + timedelta(minutes=contest.duration_minutes)
    remaining_sec = max(0, (ends_at - datetime.utcnow()).total_seconds()) if contest.status == ContestStatus.ACTIVE else 0

    return {
        **_serialize_contest(contest),
        "remaining_seconds": int(remaining_sec),
        "problems": [
            {
                "id": pid,
                "title": problem_map[pid].title if pid in problem_map else "Unknown",
                "slug": problem_map[pid].slug if pid in problem_map else "",
                "difficulty": problem_map[pid].difficulty.value if pid in problem_map else "medium",
            }
            for pid in contest.problem_ids
        ],
    }


@router.post("/{contest_id}/end")
def end_contest(contest_id: str, db: Session = Depends(get_db)):
    """End a contest early."""
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    if contest.status != ContestStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Contest already ended")
    contest.status = ContestStatus.FINISHED
    contest.ended_at = datetime.utcnow()
    db.commit()
    return {"status": "FINISHED"}


@router.get("/{contest_id}/results")
def get_results(contest_id: str, db: Session = Depends(get_db)):
    """Get scoreboard for a contest."""
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    _check_expired(contest, db)

    problems = db.query(Problem).filter(Problem.id.in_(contest.problem_ids)).all()
    problem_map = {p.id: p for p in problems}

    # Fetch submissions for this contest
    submissions = (
        db.query(Submission)
        .filter(Submission.contest_id == contest.id)
        .order_by(Submission.created_at.asc())
        .all()
    )

    results = []
    total_solved = 0
    for pid in contest.problem_ids:
        p = problem_map.get(pid)
        prob_subs = [s for s in submissions if s.problem_id == pid]
        accepted = next((s for s in prob_subs if s.status == SubmissionStatus.ACCEPTED), None)
        time_to_solve = None
        if accepted:
            total_solved += 1
            time_to_solve = int((accepted.created_at - contest.started_at).total_seconds())

        results.append({
            "problem_id": pid,
            "title": p.title if p else "Unknown",
            "difficulty": p.difficulty.value if p else "medium",
            "attempts": len(prob_subs),
            "status": "ACCEPTED" if accepted else ("ATTEMPTED" if prob_subs else "NOT_ATTEMPTED"),
            "time_to_solve_seconds": time_to_solve,
        })

    return {
        "contest_id": str(contest.id),
        "status": contest.status.value,
        "duration_minutes": contest.duration_minutes,
        "total_problems": len(contest.problem_ids),
        "total_solved": total_solved,
        "results": results,
    }


def _serialize_contest(c: Contest) -> dict:
    ends_at = c.started_at + timedelta(minutes=c.duration_minutes)
    return {
        "contest_id": str(c.id),
        "status": c.status.value,
        "duration_minutes": c.duration_minutes,
        "topic_filter": c.topic_filter or [],
        "problem_ids": c.problem_ids or [],
        "started_at": c.started_at.isoformat(),
        "ends_at": ends_at.isoformat(),
        "ended_at": c.ended_at.isoformat() if c.ended_at else None,
    }


def _check_expired(contest: Contest, db: Session):
    """Auto-end contest if time has expired."""
    if contest.status != ContestStatus.ACTIVE:
        return
    ends_at = contest.started_at + timedelta(minutes=contest.duration_minutes)
    if datetime.utcnow() > ends_at:
        contest.status = ContestStatus.FINISHED
        contest.ended_at = ends_at
        db.commit()
