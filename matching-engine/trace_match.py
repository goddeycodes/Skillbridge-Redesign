"""
Trace a specific match pairing and print a human-readable score breakdown.
Run: cd matching-engine && python trace_match.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from matcher import (
    find_best_matches,
    compute_match_score,
    _skill_to_text,
    _skill_id,
    W_SIMILARITY,
    W_CATEGORY,
    W_PROFICIENCY,
    W_LANGUAGE,
    _proficiency_score,
)


def trace_pairing(requester_skills, candidate_skills, requester_name="You", candidate_name="Partner"):
    """Print step-by-step why a specific exchange scored the way it did."""
    req_teach = [s for s in requester_skills if s.get("type") == "teach"]
    req_learn = [s for s in requester_skills if s.get("type") == "learn"]
    cand_teach = [s for s in candidate_skills if s.get("type") == "teach"]
    cand_learn = [s for s in candidate_skills if s.get("type") == "learn"]

    all_skills = req_teach + req_learn + cand_teach + cand_learn
    corpus = [_skill_to_text(s) for s in all_skills]
    vectorizer = TfidfVectorizer(stop_words="english", min_df=1)
    tfidf_matrix = vectorizer.fit_transform(corpus)
    skill_index = {_skill_id(s): i for i, s in enumerate(all_skills)}

    print(f"\n{'='*60}")
    print(f"  MATCH TRACE: {requester_name}  <->  {candidate_name}")
    print(f"{'='*60}\n")

    print("YOUR PROFILE")
    for s in req_teach:
        print(f"  TEACH  {s['name']} ({s.get('category')}, {s.get('proficiency')})")
    for s in req_learn:
        print(f"  LEARN  {s['name']} ({s.get('category')}, {s.get('proficiency')})")

    print(f"\n{candidate_name.upper()}'S PROFILE")
    for s in cand_teach:
        print(f"  TEACH  {s['name']} ({s.get('category')}, {s.get('proficiency')})")
    for s in cand_learn:
        print(f"  LEARN  {s['name']} ({s.get('category')}, {s.get('proficiency')})")

    # Find best combination (same logic as engine)
    from itertools import product
    best = None
    best_score = 0

    for rt, cl, ct, rl in product(req_teach, cand_learn, cand_teach, req_learn):
        rt_i = skill_index[_skill_id(rt)]
        rl_i = skill_index[_skill_id(rl)]
        ct_i = skill_index[_skill_id(ct)]
        cl_i = skill_index[_skill_id(cl)]

        score = compute_match_score(
            rt, rl, ct, cl, vectorizer, tfidf_matrix, rt_i, rl_i, ct_i, cl_i
        )
        if score > best_score:
            best_score = score
            best = (rt, rl, ct, cl, rt_i, rl_i, ct_i, cl_i)

    if not best:
        print("\nNo valid exchange pairing found.")
        return

    rt, rl, ct, cl, rt_i, rl_i, ct_i, cl_i = best

    print("\nSELECTED EXCHANGE")
    print(f"  You teach  -> {rt['name']}  ->  {candidate_name} learns")
    print(f"  You learn  <- {ct['name']}  <-  {candidate_name} teaches")

    sim_you = float(cosine_similarity(tfidf_matrix[rt_i], tfidf_matrix[cl_i])[0][0])
    sim_them = float(cosine_similarity(tfidf_matrix[ct_i], tfidf_matrix[rl_i])[0][0])
    sim = (sim_you + sim_them) / 2

    cat_score = 1.0 if (
        rt.get("category") == cl.get("category") or
        ct.get("category") == rl.get("category")
    ) else 0.0

    prof_score = _proficiency_score(ct.get("proficiency"), rl.get("proficiency"))
    lang_score = 1.0 if (rt.get("language") or "English").lower() == (ct.get("language") or "English").lower() else 0.2

    print("\nSCORE BREAKDOWN")
    print(f"  Text similarity — you teach vs they learn:")
    print(f"    '{rt['name']}' vs '{cl['name']}'  ->  {sim_you:.3f}  (contributes {W_SIMILARITY * sim_you / 2:.3f})")
    print(f"  Text similarity — they teach vs you learn:")
    print(f"    '{ct['name']}' vs '{rl['name']}'  ->  {sim_them:.3f}  (contributes {W_SIMILARITY * sim_them / 2:.3f})")
    print(f"  Combined text similarity avg: {sim:.3f}  × {W_SIMILARITY} = {W_SIMILARITY * sim:.3f}")

    cat_reason = []
    if rt.get("category") == cl.get("category"):
        cat_reason.append(f"your teach ({rt.get('category')}) = their learn ({cl.get('category')})")
    if ct.get("category") == rl.get("category"):
        cat_reason.append(f"their teach ({ct.get('category')}) = your learn ({rl.get('category')})")
    print(f"  Category match: {cat_score:.0f}  × {W_CATEGORY} = {W_CATEGORY * cat_score:.3f}")
    if cat_reason:
        print(f"    ({'; '.join(cat_reason)})")
    else:
        print(f"    (no shared categories across the exchange)")

    print(f"  Proficiency fit: {prof_score:.3f}  × {W_PROFICIENCY} = {W_PROFICIENCY * prof_score:.3f}")
    print(f"    ({candidate_name} teaches at '{ct.get('proficiency')}', you learn at '{rl.get('proficiency')}')")

    print(f"  Language match: {lang_score:.3f}  × {W_LANGUAGE} = {W_LANGUAGE * lang_score:.3f}")

    total = W_SIMILARITY * sim + W_CATEGORY * cat_score + W_PROFICIENCY * prof_score + W_LANGUAGE * lang_score
    print(f"\n  TOTAL SCORE: {total:.4f}  ->  {round(total * 100)}% match")

    if sim < 0.05 and cat_score == 0:
        print("\n  ⚠ Would be rejected by relevance gate (no text or category overlap)")


if __name__ == "__main__":
    # Scenario from user's screenshot: Graphic Design search, You teach Typing
    you = [
        {
            "_id": "you_teach", "userId": "you", "name": "Typing", "category": "Technology",
            "type": "teach", "proficiency": "intermediate", "tags": ["keyboard", "speed"],
            "language": "English", "description": "Touch typing and speed improvement",
        },
        {
            "_id": "you_learn", "userId": "you", "name": "Graphic Design", "category": "Design",
            "type": "learn", "proficiency": "beginner", "tags": ["figma", "ui"],
            "language": "English", "description": "Want to learn visual design basics",
        },
    ]

    kwaku = [
        {
            "_id": "k_teach", "userId": "kwaku", "name": "Graphic Design", "category": "Design",
            "type": "teach", "proficiency": "expert", "tags": ["figma", "ui", "branding"],
            "language": "English", "description": "Professional graphic and UI design",
        },
        {
            "_id": "k_learn", "userId": "kwaku", "name": "Typing", "category": "Technology",
            "type": "learn", "proficiency": "beginner", "tags": ["keyboard"],
            "language": "English", "description": "Want to improve typing speed",
        },
    ]

    trace_pairing(you, kwaku, requester_name="You (AG)", candidate_name="Kwaku Basoa")

    matches = find_best_matches("you", you, kwaku)
    print(f"\nEngine result: {len(matches)} match(es)")
    if matches:
        m = matches[0]
        print(f"  youTeach={m['youTeach']}, youLearn={m['youLearn']}")
        print(f"  theyTeach={m['theyTeach']}, theyLearn={m['theyLearn']}")
        print(f"  score={m['score']} ({round(m['score']*100)}%)")
