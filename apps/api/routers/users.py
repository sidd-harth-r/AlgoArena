from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import Submission, SubmissionStatus, User, Problem, Difficulty


router = APIRouter()

DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


def ensure_demo_user(db: Session):
    user = db.query(User).filter(User.id == DEMO_USER_ID).first()
    if user:
        return user
    user = User(id=DEMO_USER_ID, email="demo@algoarena.dev", username="demo", avatar_url="", last_active=datetime.utcnow())
    db.add(user)
    db.commit()
    return user


@router.get("/me")
def me(db: Session = Depends(get_db)):
    user = ensure_demo_user(db)
    solved = db.query(Submission.problem_id).filter(Submission.user_id == user.id, Submission.status == SubmissionStatus.ACCEPTED).distinct().count()
    return {"id": str(user.id), "email": user.email, "username": user.username, "avatar_url": user.avatar_url, "streak_days": user.streak_days, "solved_count": solved}


@router.get("/me/solved")
def solved_problems(db: Session = Depends(get_db)):
    """Return list of problem IDs the user has solved (ACCEPTED)."""
    user = ensure_demo_user(db)
    solved_ids = (
        db.query(Submission.problem_id)
        .filter(Submission.user_id == user.id, Submission.status == SubmissionStatus.ACCEPTED)
        .distinct()
        .all()
    )
    return [row[0] for row in solved_ids]


@router.get("/me/dashboard")
def me_dashboard(db: Session = Depends(get_db)):
    user = ensure_demo_user(db)
    
    # Fetch all published problems
    all_problems = db.query(Problem).filter(Problem.is_published == True).all()
    easy_total = sum(1 for p in all_problems if p.difficulty == Difficulty.EASY)
    medium_total = sum(1 for p in all_problems if p.difficulty == Difficulty.MEDIUM)
    hard_total = sum(1 for p in all_problems if p.difficulty == Difficulty.HARD)
    
    # Solved problems grouped by difficulty
    solved_submissions = (
        db.query(Submission.problem_id, Problem.difficulty)
        .join(Problem, Submission.problem_id == Problem.id)
        .filter(Submission.user_id == user.id, Submission.status == SubmissionStatus.ACCEPTED)
        .distinct(Submission.problem_id)
        .all()
    )
    
    solved_ids = {row[0] for row in solved_submissions}
    easy_solved = sum(1 for row in solved_submissions if row[1] == Difficulty.EASY)
    medium_solved = sum(1 for row in solved_submissions if row[1] == Difficulty.MEDIUM)
    hard_solved = sum(1 for row in solved_submissions if row[1] == Difficulty.HARD)
    
    # Attempted (but not solved)
    all_attempted_ids = {
        row[0] for row in db.query(Submission.problem_id).filter(Submission.user_id == user.id).all()
    }
    attempting_count = len(all_attempted_ids - solved_ids)
    
    # Streaks and Heatmap
    all_submissions = (
        db.query(Submission.created_at, Submission.status)
        .filter(Submission.user_id == user.id)
        .all()
    )
    
    calendar = {}
    dates = set()
    for sub in all_submissions:
        if sub.created_at:
            date_str = sub.created_at.date().isoformat()
            calendar[date_str] = calendar.get(date_str, 0) + 1
            dates.add(sub.created_at.date())
            
    sorted_dates = sorted(list(dates))
    total_active_days = len(sorted_dates)
    
    max_streak = 0
    current_run = 0
    prev_date = None
    for d in sorted_dates:
        if prev_date is None:
            current_run = 1
        elif (d - prev_date).days == 1:
            current_run += 1
        else:
            max_streak = max(max_streak, current_run)
            current_run = 1
        prev_date = d
    max_streak = max(max_streak, current_run)
    
    from datetime import date as datetime_date, timedelta
    today = datetime_date.today()
    current_streak = 0
    if sorted_dates:
        last_date = sorted_dates[-1]
        if last_date == today or last_date == today - timedelta(days=1):
            current_streak = 1
            idx = len(sorted_dates) - 1
            while idx > 0 and (sorted_dates[idx] - sorted_dates[idx-1]).days == 1:
                current_streak += 1
                idx -= 1
        else:
            current_streak = 0
            
    # Recent AC Submissions
    recent_ac_subs = (
        db.query(Submission)
        .join(Problem, Submission.problem_id == Problem.id)
        .filter(Submission.user_id == user.id, Submission.status == SubmissionStatus.ACCEPTED)
        .order_by(Submission.created_at.desc())
        .limit(10)
        .all()
    )
    
    recent_ac = []
    for sub in recent_ac_subs:
        recent_ac.append({
            "id": str(sub.id),
            "problem_id": sub.problem_id,
            "problem_title": sub.problem.title,
            "problem_slug": sub.problem.slug,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
            "language": sub.language
        })
        
    # Recent All Submissions (for Solutions tab)
    recent_all_subs = (
        db.query(Submission)
        .join(Problem, Submission.problem_id == Problem.id)
        .filter(Submission.user_id == user.id)
        .order_by(Submission.created_at.desc())
        .limit(10)
        .all()
    )
    recent_all = []
    for sub in recent_all_subs:
        recent_all.append({
            "id": str(sub.id),
            "problem_id": sub.problem_id,
            "problem_title": sub.problem.title,
            "problem_slug": sub.problem.slug,
            "status": sub.status.value,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
            "language": sub.language
        })

    return {
        "stats": {
            "easy": {"solved": easy_solved, "total": easy_total},
            "medium": {"solved": medium_solved, "total": medium_total},
            "hard": {"solved": hard_solved, "total": hard_total},
            "total": {"solved": len(solved_ids), "total": len(all_problems)},
            "attempting": attempting_count
        },
        "calendar": calendar,
        "streak": {
            "current": current_streak,
            "max": max_streak,
            "total_active_days": total_active_days
        },
        "recent_ac": recent_ac,
        "recent_all": recent_all
    }

