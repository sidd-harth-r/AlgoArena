import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.models import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://algoarena:localpassword@localhost:5432/algoarena")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
