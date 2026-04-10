from pydantic import BaseModel

# 1. IELTS skill statistics
class IELTSSkillDistribution(BaseModel):
    Reading: int
    Listening: int
    Writing: int
    Speaking: int


# 2. APTIS skill statistics (only counts individual skill practice)
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

    # Total number of submissions (both IELTS and individual APTIS skills)
    total_submissions: int

    # Currently only counting IELTS Full Tests
    total_full_tests: int

    total_aptis_full_tests: int
    total_aptis_submissions: int

    # Detailed skill distribution
    ielts_skills: IELTSSkillDistribution
    aptis_skills: AptisSkillDistribution