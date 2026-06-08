import json
import os
from datetime import datetime
import enum
import uuid

from dotenv import load_dotenv
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, ARRAY
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

load_dotenv()

Base = declarative_base()


class SubmissionStatus(enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    ACCEPTED = "ACCEPTED"
    WRONG_ANSWER = "WRONG_ANSWER"
    TIME_LIMIT = "TIME_LIMIT_EXCEEDED"
    MEMORY_LIMIT = "MEMORY_LIMIT_EXCEEDED"
    RUNTIME_ERROR = "RUNTIME_ERROR"
    COMPILE_ERROR = "COMPILE_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class BigOClass(enum.Enum):
    O1 = "O(1)"
    OLOGN = "O(log n)"
    ON = "O(n)"
    ONlogN = "O(n log n)"
    ON2 = "O(n^2)"
    ON3 = "O(n^3)"
    O2N = "O(2^n)"
    OVE = "O(V+E)"
    OMN = "O(m*n)"
    ONLOGK = "O(n log k)"
    OELOGV = "O(E log V)"


class Difficulty(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ContestStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    FINISHED = "FINISHED"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    avatar_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    streak_days = Column(Integer, default=0)
    last_active = Column(DateTime)
    submissions = relationship("Submission", back_populates="user")
    hint_usages = relationship("HintUsage", back_populates="user")
    contests = relationship("Contest", back_populates="user")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    statement_md = Column(Text, nullable=False)
    difficulty = Column(SAEnum(Difficulty), nullable=False)
    topic_tags = Column(ARRAY(String), default=[])
    optimal_complexity = Column(SAEnum(BigOClass), nullable=False)
    editorial_md = Column(Text)
    time_limit_ms = Column(Integer, default=2000)
    memory_limit_mb = Column(Integer, default=256)
    is_published = Column(Boolean, default=False)
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem")


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_out = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    problem = relationship("Problem", back_populates="test_cases")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id"), nullable=True)
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    status = Column(SAEnum(SubmissionStatus), default=SubmissionStatus.PENDING)
    passed_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    runtime_ms = Column(Integer)
    memory_kb = Column(Integer)
    error_message = Column(Text)
    failed_input = Column(Text)
    expected_output = Column(Text)
    actual_output = Column(Text)
    judge0_token = Column(String)
    user_complexity = Column(SAEnum(BigOClass))
    optimal_complexity = Column(SAEnum(BigOClass))
    is_optimal = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
    contest = relationship("Contest", back_populates="submissions")


class HintUsage(Base):
    __tablename__ = "hint_usage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    hint_count = Column(Integer, default=0)
    last_hint_at = Column(DateTime)
    user = relationship("User", back_populates="hint_usages")


class Contest(Base):
    __tablename__ = "contests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(SAEnum(ContestStatus), default=ContestStatus.ACTIVE)
    duration_minutes = Column(Integer, nullable=False)
    topic_filter = Column(ARRAY(String), default=[])
    problem_ids = Column(ARRAY(Integer), default=[])
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="contests")
    submissions = relationship("Submission", back_populates="contest")
