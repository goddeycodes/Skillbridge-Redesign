from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from matcher import find_best_matches

app = FastAPI(title="SkillBridge Matching Engine", version="1.0.0")


class SkillInput(BaseModel):
    userId:      str
    name:        str
    category:    str
    type:        str                    # 'teach' | 'learn'
    proficiency: Optional[str] = None
    tags:        Optional[List[str]] = []
    language:    Optional[str] = "English"
    description: Optional[str] = ""
    id:          Optional[str] = None   # Mongo _id passed through from Express

    def to_dict(self) -> dict:
        d = self.model_dump()
        d["_id"] = d.pop("id")
        return d


class MatchRequest(BaseModel):
    requesterId:       str
    requesterSkills:   List[SkillInput]
    allSkills:         List[SkillInput]
    requesterTimezone: Optional[str] = "UTC"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/match")
def get_matches(request: MatchRequest):
    requester_skills = [s.to_dict() for s in request.requesterSkills]
    all_skills       = [s.to_dict() for s in request.allSkills]

    matches = find_best_matches(
        requester_id=request.requesterId,
        requester_skills=requester_skills,
        all_skills=all_skills,
    )

    return {"matches": matches}