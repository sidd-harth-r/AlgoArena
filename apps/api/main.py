from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.database import Base, engine
from routers import ai, contests, problems, roadmap, submissions, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlgoArena API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router, prefix="/problems", tags=["problems"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(roadmap.router, prefix="/roadmap", tags=["roadmap"])
app.include_router(contests.router, prefix="/contests", tags=["contests"])


@app.get("/health")
def health():
    return {"status": "ok"}
