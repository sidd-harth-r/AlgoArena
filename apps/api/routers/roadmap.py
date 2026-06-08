"""Topic Roadmap router — serves the 18-node dependency tree for the roadmap page."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.database import get_db
from models.models import Problem, Submission, SubmissionStatus
from routers.users import DEMO_USER_ID, ensure_demo_user

router = APIRouter()

# ── 18 roadmap nodes with dependency edges ──────────────────────────────── #
ROADMAP_NODES = [
    {"id": "arrays",         "label": "Arrays & Hashing",     "prereqs": [],                "topics": ["Arrays", "Hash maps"]},
    {"id": "two-pointers",   "label": "Two Pointers",         "prereqs": ["arrays"],         "topics": ["Two pointers"]},
    {"id": "stack",          "label": "Stack",                 "prereqs": ["arrays"],         "topics": ["Stack"]},
    {"id": "binary-search",  "label": "Binary Search",        "prereqs": ["arrays"],         "topics": ["Binary search"]},
    {"id": "sliding-window", "label": "Sliding Window",       "prereqs": ["arrays"],         "topics": ["Sliding window"]},
    {"id": "linked-list",    "label": "Linked List",          "prereqs": ["arrays"],         "topics": ["Linked lists"]},
    {"id": "trees",          "label": "Trees",                "prereqs": ["linked-list"],     "topics": ["Trees"]},
    {"id": "tries",          "label": "Tries",                "prereqs": ["trees"],           "topics": ["Tries"]},
    {"id": "heap",           "label": "Heap / Priority Queue", "prereqs": ["trees"],          "topics": ["Heap"]},
    {"id": "graphs",         "label": "Graphs",               "prereqs": ["trees"],           "topics": ["Graphs"]},
    {"id": "adv-graphs",     "label": "Advanced Graphs",      "prereqs": ["graphs"],          "topics": ["Graphs"]},
    {"id": "dp-1d",          "label": "1-D DP",               "prereqs": ["arrays"],          "topics": ["Dynamic programming"]},
    {"id": "dp-2d",          "label": "2-D DP",               "prereqs": ["dp-1d"],           "topics": ["Dynamic programming"]},
    {"id": "greedy",         "label": "Greedy",               "prereqs": ["arrays"],          "topics": ["Greedy"]},
    {"id": "intervals",      "label": "Intervals",            "prereqs": ["arrays"],          "topics": ["Intervals"]},
    {"id": "bit-manip",      "label": "Bit Manipulation",     "prereqs": ["arrays"],          "topics": ["Bit manipulation"]},
    {"id": "math",           "label": "Math & Geometry",      "prereqs": ["arrays"],          "topics": ["Math"]},
    {"id": "backtracking",   "label": "Backtracking",         "prereqs": ["trees"],           "topics": ["Backtracking"]},
]


@router.get("/")
def get_roadmap(db: Session = Depends(get_db)):
    """Return roadmap nodes with solved/total counts per topic group."""
    ensure_demo_user(db)

    # Fetch all problems and user's solved set
    all_problems = db.query(Problem).filter(Problem.is_published.is_(True)).all()
    solved_ids = set(
        row[0] for row in
        db.query(Submission.problem_id)
        .filter(Submission.user_id == DEMO_USER_ID, Submission.status == SubmissionStatus.ACCEPTED)
        .distinct()
        .all()
    )

    # Build a map: topic tag → list of problems
    topic_problems: dict[str, list] = {}
    for p in all_problems:
        for tag in (p.topic_tags or []):
            topic_problems.setdefault(tag, []).append(p)

    result = []
    for node in ROADMAP_NODES:
        # Collect all problems matching any of the node's topics
        problems_in_node = []
        seen_ids = set()
        for topic in node["topics"]:
            for p in topic_problems.get(topic, []):
                if p.id not in seen_ids:
                    seen_ids.add(p.id)
                    problems_in_node.append({
                        "id": p.id,
                        "title": p.title,
                        "slug": p.slug,
                        "difficulty": p.difficulty.value,
                        "solved": p.id in solved_ids,
                    })

        total = len(problems_in_node)
        solved_count = sum(1 for p in problems_in_node if p["solved"])

        result.append({
            "id": node["id"],
            "label": node["label"],
            "prereqs": node["prereqs"],
            "problems": problems_in_node,
            "total": total,
            "solved": solved_count,
        })

    return result
