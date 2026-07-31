"""
SkillBridge Matching Engine
Scores every candidate user against the requester using four weighted factors:
  40%  TF-IDF cosine similarity  (name + category + tags + description)
  25%  Category match bonus
  20%  Proficiency compatibility
  15%  Language match bonus

Relevance gate: if semantic similarity AND category both score zero,
the pair is considered unrelated regardless of proficiency/language.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from itertools import product
from collections import defaultdict


# ── Weights ───────────────────────────────────────────────────────────────────
W_SIMILARITY   = 0.40
W_CATEGORY     = 0.25
W_PROFICIENCY  = 0.20
W_LANGUAGE     = 0.15

# Proficiency ordering — higher index = more advanced
PROFICIENCY_ORDER = ["beginner", "intermediate", "advanced", "expert"]

MATCH_THRESHOLD = 0.15   # minimum score to surface a match
MAX_RESULTS     = 20


# ── Helpers ───────────────────────────────────────────────────────────────────

def _skill_id(skill: dict) -> str:
    """Mongo _id is passed through as a plain string by the backend."""
    return skill.get("_id") or skill.get("id") or ""


def _skill_to_text(skill: dict) -> str:
    """Combine all text fields into a single corpus document."""
    parts = [
        skill.get("name", ""),
        skill.get("category", ""),
        skill.get("description", ""),
    ]
    tags = skill.get("tags") or []
    parts.extend(tags)
    return " ".join(p for p in parts if p).lower()


def _proficiency_score(teacher_prof: str, learner_prof: str) -> float:
    """
    Returns a score 0–1 reflecting how well the teacher's level
    suits the learner's level.
    Best: teacher is one or two levels above learner.
    Acceptable: teacher is at same level.
    Poor: learner is more advanced than teacher.
    """
    if not teacher_prof or not learner_prof:
        return 0.5   # unknown — neutral

    t_idx = PROFICIENCY_ORDER.index(teacher_prof) if teacher_prof in PROFICIENCY_ORDER else 1
    l_idx = PROFICIENCY_ORDER.index(learner_prof) if learner_prof in PROFICIENCY_ORDER else 1

    diff = t_idx - l_idx   # positive = teacher is ahead

    if diff == 2:   return 1.0    # ideal gap
    if diff == 1:   return 0.9
    if diff == 0:   return 0.7    # peers — still useful
    if diff == -1:  return 0.3    # learner slightly ahead
    if diff <= -2:  return 0.0    # learner more advanced than teacher
    return 0.5


def compute_match_score(
    requester_teach: dict,
    requester_learn: dict,
    candidate_teach: dict,
    candidate_learn: dict,
    vectorizer: TfidfVectorizer,
    tfidf_matrix,
    req_teach_idx: int,
    cand_teach_idx: int,
) -> float:
    """
    Compute a single pairwise match score between one requester
    teach/learn pair and one candidate teach/learn pair.
    """
    # ── 1. TF-IDF cosine similarity ──────────────────────────────────────────
    # Does what the requester teaches match what the candidate wants to learn?
    # Does what the candidate teaches match what the requester wants to learn?
    sim_a = float(cosine_similarity(
        tfidf_matrix[req_teach_idx],
        tfidf_matrix[cand_teach_idx]
    )[0][0])

    sim = sim_a   # single direction is sufficient for ranking

    # ── 2. Category match bonus ───────────────────────────────────────────────
    cat_score = 1.0 if (
        requester_teach.get("category") == candidate_learn.get("category") or
        candidate_teach.get("category") == requester_learn.get("category")
    ) else 0.0

    # ── Relevance gate ────────────────────────────────────────────────────────
    # Proficiency and language are tie-breakers, not substitutes for actual
    # skill relevance. If there's no text similarity AND no category match,
    # the skills are unrelated — return zero regardless of other factors.
    if sim < 0.05 and cat_score == 0.0:
        return 0.0

    # ── 3. Proficiency score ─────────────────────────────────────────────────
    # Candidate teaches → requester learns
    prof_score = _proficiency_score(
        candidate_teach.get("proficiency"),
        requester_learn.get("proficiency"),
    )

    # ── 4. Language match bonus ───────────────────────────────────────────────
    req_lang  = (requester_teach.get("language") or "English").lower()
    cand_lang = (candidate_teach.get("language") or "English").lower()
    lang_score = 1.0 if req_lang == cand_lang else 0.2

    # ── Weighted sum ─────────────────────────────────────────────────────────
    score = (
        W_SIMILARITY  * sim        +
        W_CATEGORY    * cat_score  +
        W_PROFICIENCY * prof_score +
        W_LANGUAGE    * lang_score
    )

    return round(score, 4)


# ── Main entry point ─────────────────────────────────────────────────────────

def find_best_matches(
    requester_id: str,
    requester_skills: list,
    all_skills: list,
) -> list:
    """
    Find and rank the best exchange partners for the requester.

    Args:
        requester_id:     The requesting user's ID (to exclude from candidates).
        requester_skills: List of skill dicts belonging to the requester.
        all_skills:       List of skill dicts from ALL other users.

    Returns:
        List of match dicts sorted by score descending, capped at MAX_RESULTS.
    """
    # Split requester skills by type
    req_teach = [s for s in requester_skills if s.get("type") == "teach"]
    req_learn = [s for s in requester_skills if s.get("type") == "learn"]

    if not req_teach or not req_learn:
        return []

    # Group candidate skills by userId
    candidate_skills: dict = defaultdict(lambda: {"teach": [], "learn": []})
    for skill in all_skills:
        uid = skill.get("userId")
        if uid and uid != requester_id:
            candidate_skills[uid][skill.get("type", "")].append(skill)

    # Only consider candidates who have BOTH teach and learn skills
    valid_candidates = {
        uid: skills
        for uid, skills in candidate_skills.items()
        if skills["teach"] and skills["learn"]
    }

    if not valid_candidates:
        return []

    # Build TF-IDF corpus — all teach skills (requester + candidates)
    all_teach_skills = req_teach + [
        s
        for skills in valid_candidates.values()
        for s in skills["teach"]
    ]

    corpus = [_skill_to_text(s) for s in all_teach_skills]

    try:
        vectorizer   = TfidfVectorizer(stop_words="english", min_df=1)
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        # Corpus too small / all stop words
        return []

    # Index map: skill _id → row in tfidf_matrix
    skill_index = {_skill_id(s): i for i, s in enumerate(all_teach_skills)}

    results = []

    for cand_id, cand_skills in valid_candidates.items():
        best_score      = 0.0
        best_req_teach  = req_teach[0]
        best_req_learn  = req_learn[0]
        best_cand_teach = cand_skills["teach"][0]
        best_cand_learn = cand_skills["learn"][0]

        # Try every combination of teach/learn pairs
        for rt, cl, ct, rl in product(
            req_teach, cand_skills["learn"],
            cand_skills["teach"], req_learn
        ):
            req_teach_idx  = skill_index.get(_skill_id(rt), -1)
            cand_teach_idx = skill_index.get(_skill_id(ct), -1)

            if req_teach_idx < 0 or cand_teach_idx < 0:
                continue

            score = compute_match_score(
                requester_teach=rt,
                requester_learn=rl,
                candidate_teach=ct,
                candidate_learn=cl,
                vectorizer=vectorizer,
                tfidf_matrix=tfidf_matrix,
                req_teach_idx=req_teach_idx,
                cand_teach_idx=cand_teach_idx,
            )

            if score > best_score:
                best_score      = score
                best_req_teach  = rt
                best_req_learn  = rl
                best_cand_teach = ct
                best_cand_learn = cl

        if best_score > MATCH_THRESHOLD:
            results.append({
                "candidateId":       cand_id,
                "score":             best_score,
                "youTeach":          best_req_teach.get("name"),
                "youTeachId":        _skill_id(best_req_teach),
                "youLearn":          best_req_learn.get("name"),
                "youLearnId":        _skill_id(best_req_learn),
                "theyTeach":         best_cand_teach.get("name"),
                "theyTeachId":       _skill_id(best_cand_teach),
                "theyLearn":         best_cand_learn.get("name"),
                "theyLearnId":       _skill_id(best_cand_learn),
                "theyTeachCategory": best_cand_teach.get("category"),
                "theyTeachProf":     best_cand_teach.get("proficiency"),
                "theyTeachLang":     best_cand_teach.get("language", "English"),
                "theyTeachDesc":     best_cand_teach.get("description", ""),
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:MAX_RESULTS]