from pydantic import BaseModel

# 1. Thống kê kỹ năng IELTS 
class IELTSSkillDistribution(BaseModel):
    Reading: int
    Listening: int
    Writing: int
    Speaking: int

# 2. Thống kê kỹ năng APTIS (Chỉ tính luyện tập lẻ từng kỹ năng)
class AptisSkillDistribution(BaseModel):
    GrammarVocab: int 
    Reading: int
    Listening: int
    Writing: int
    Speaking: int

# 3. Tổng hợp thống kê toàn hệ thống
class SystemStats(BaseModel):
    total_users: int
    new_users_today: int
    
    # Tổng số lượt nộp bài chung (Cả IELTS và APTIS lẻ)
    total_submissions: int
    
    # Tạm thời chỉ đếm Full Test của IELTS
    total_full_tests: int 
    
    total_aptis_full_tests: int 
    
    # Phân bổ chi tiết từng kỹ năng
    ielts_skills: IELTSSkillDistribution
    aptis_skills: AptisSkillDistribution