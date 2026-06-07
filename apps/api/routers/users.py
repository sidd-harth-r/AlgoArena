import os
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import Submission, SubmissionStatus, User

router = APIRouter()

_IS_SQLITE = os.getenv("DATABASE_URL", "").startswith("sqlite")
if _IS_SQLITE:
    DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
else:
    from uuid import UUID
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
