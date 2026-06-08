from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.database import Base, engine
from routers import ai, problems, submissions, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlgoArena API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router, prefix="/problems", tags=["problems"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


@app.get("/health")
def health():
    return {"status": "ok"}
