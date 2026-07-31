"""
Quick local test for the matching engine — no DB or API needed.
Run: cd matching-engine && .venv/Scripts/python -m pytest tests/ -v
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from matcher import find_best_matches, compute_match_score


def test_basic_two_way_match():
    """Alice teaches Python & wants Design. Bob teaches Design & wants Python. Should match well."""
    requester_skills = [
        {"_id": "skillA1", "userId": "alice", "name": "Python Programming", "category": "Technology",
         "type": "teach", "proficiency": "advanced", "tags": ["python"], "language": "English", "description": "Backend dev"},
        {"_id": "skillA2", "userId": "alice", "name": "Graphic Design", "category": "Design",
         "type": "learn", "proficiency": "beginner", "tags": ["figma"], "language": "English", "description": ""},
    ]
    all_skills = [
        {"_id": "skillB1", "userId": "bob", "name": "Graphic Design", "category": "Design",
         "type": "teach", "proficiency": "expert", "tags": ["figma", "ui"], "language": "English", "description": "UI/UX expert"},
        {"_id": "skillB2", "userId": "bob", "name": "Python Programming", "category": "Technology",
         "type": "learn", "proficiency": "beginner", "tags": ["python"], "language": "English", "description": ""},
    ]

    matches = find_best_matches("alice", requester_skills, all_skills)

    assert len(matches) == 1
    assert matches[0]["candidateId"] == "bob"
    assert matches[0]["score"] > 0.5
    assert matches[0]["youTeachId"] == "skillA1"
    assert matches[0]["theyTeachId"] == "skillB1"


def test_no_match_when_no_overlap():
    """Alice teaches Python, wants Cooking. Bob teaches Music, wants Fitness. No exchange possible."""
    requester_skills = [
        {"_id": "s1", "userId": "alice", "name": "Python", "category": "Technology", "type": "teach",
         "proficiency": "advanced", "tags": [], "language": "English", "description": ""},
        {"_id": "s2", "userId": "alice", "name": "Cooking", "category": "Cooking", "type": "learn",
         "proficiency": "beginner", "tags": [], "language": "English", "description": ""},
    ]
    all_skills = [
        {"_id": "s3", "userId": "bob", "name": "Guitar", "category": "Music", "type": "teach",
         "proficiency": "advanced", "tags": [], "language": "English", "description": ""},
        {"_id": "s4", "userId": "bob", "name": "Fitness Training", "category": "Fitness", "type": "learn",
         "proficiency": "beginner", "tags": [], "language": "English", "description": ""},
    ]

    matches = find_best_matches("alice", requester_skills, all_skills)
    assert len(matches) == 0


def test_candidate_excluded_without_both_sides():
    """Bob only teaches — no 'learn' skill — so he can't be a valid exchange partner."""
    requester_skills = [
        {"_id": "s1", "userId": "alice", "name": "Python", "category": "Technology", "type": "teach",
         "proficiency": "advanced", "tags": [], "language": "English", "description": ""},
        {"_id": "s2", "userId": "alice", "name": "Design", "category": "Design", "type": "learn",
         "proficiency": "beginner", "tags": [], "language": "English", "description": ""},
    ]
    all_skills = [
        {"_id": "s3", "userId": "bob", "name": "Design", "category": "Design", "type": "teach",
         "proficiency": "expert", "tags": [], "language": "English", "description": ""},
        # Bob has no 'learn' skill at all
    ]

    matches = find_best_matches("alice", requester_skills, all_skills)
    assert len(matches) == 0


def test_proficiency_scoring_favors_teacher_ahead():
    teacher_expert = {"proficiency": "expert"}
    teacher_beginner = {"proficiency": "beginner"}
    learner = {"proficiency": "beginner"}

    from matcher import _proficiency_score
    assert _proficiency_score(teacher_expert["proficiency"], learner["proficiency"]) > \
           _proficiency_score(teacher_beginner["proficiency"], learner["proficiency"])


if __name__ == "__main__":
    test_basic_two_way_match()
    test_no_match_when_no_overlap()
    test_candidate_excluded_without_both_sides()
    test_proficiency_scoring_favors_teacher_ahead()
    print("✅ All matcher tests passed!")
