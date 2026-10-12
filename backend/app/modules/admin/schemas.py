from pydantic import BaseModel

# APTIS skill statistics (only counts individual skill practice)
class AptisSkillDistribution(BaseModel):
    GrammarVocab: int
    Reading: int
    Listening: int
    Writing: int
    Speaking: int


# 3. Overall system statistics
class SystemStats(BaseModel):
    total_users: int
    new_users_today: int

    total_aptis_full_tests: int
    total_aptis_submissions: int

    # Detailed APTIS skill distribution
    aptis_skills: AptisSkillDistribution

    # Optional teacher-specific stats
    teacher_students: int | None = None
    teacher_aptis_submissions: int | None = None
