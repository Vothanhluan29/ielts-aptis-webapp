from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import enum

# 1. Định nghĩa Enum loại kỹ năng (Chuẩn form 5 kỹ năng Aptis)
class SkillType(str, enum.Enum):
    GRAMMAR_VOCAB = "GRAMMAR_VOCAB"
    READING = "READING"
    LISTENING = "LISTENING"
    WRITING = "WRITING"
    SPEAKING = "SPEAKING"
    FULLTEST = "FULLTEST"

# 2. Thống kê từng kỹ năng lẻ (Thang 0-50)
class SkillStats(BaseModel):
    skill: SkillType
    average_score: float = 0.0
    total_tests: int = 0

# 3. Thống kê Full Mock Test (Thang 0-250)
class FullTestStats(BaseModel):
    total_exams: int = 0         
    average_overall: float = 0.0 
    highest_overall: float = 0.0 
    highest_cefr: Optional[str] = None # Dành riêng cho Aptis

# 4. Chi tiết một hoạt động (ActivityItem)
class ActivityItem(BaseModel):
    id: int               
    type: SkillType       
    title: str            
    score: Optional[float] = None  
    cefr_level: Optional[str] = None # Ví dụ: B1, B2, C
    date: datetime        

# 5. Dữ liệu vẽ biểu đồ (Chart Data Point) - 5 đường kỹ năng + 1 đường Full Test
class ChartDataPoint(BaseModel):
    date: str             
    grammar_vocab: Optional[float] = None
    reading: Optional[float] = None
    listening: Optional[float] = None
    writing: Optional[float] = None
    speaking: Optional[float] = None
    full_test: Optional[float] = None 

# 6. Thông tin chuỗi ngày học tập (Streak)
class StreakInfo(BaseModel):
    current_streak: int      
    activity_map: List[bool] 

# =================================================================
# CÁC RESPONSE SCHEMAS CHO MICRO-ENDPOINTS APTIS
# =================================================================

class AptisOverviewStatsResponse(BaseModel):
    full_test_stats: FullTestStats
    skill_stats: List[SkillStats]
    
    class Config:
        from_attributes = True

class AptisProgressResponse(BaseModel):
    chart_data: List[ChartDataPoint]
    streak_info: StreakInfo
    
    class Config:
        from_attributes = True