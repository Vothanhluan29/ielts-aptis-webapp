from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import enum

class SkillType(str, enum.Enum):
    GRAMMAR_VOCAB = "GRAMMAR_VOCAB"
    READING = "READING"
    LISTENING = "LISTENING"
    WRITING = "WRITING"
    SPEAKING = "SPEAKING"
    FULLTEST = "FULLTEST"


class SkillStats(BaseModel):
    skill: SkillType
    average_score: float = 0.0
    total_tests: int = 0
class FullTestStats(BaseModel):
    total_exams: int = 0         
    average_overall: float = 0.0 
    highest_overall: float = 0.0 
    highest_cefr: Optional[str] = None 

# 4. ActivityItem
class ActivityItem(BaseModel):
    id: int               
    type: SkillType       
    title: str            
    score: Optional[float] = None  
    cefr_level: Optional[str] = None 
    date: datetime        


class ChartDataPoint(BaseModel):
    date: str             
    grammar_vocab: Optional[float] = None
    reading: Optional[float] = None
    listening: Optional[float] = None
    writing: Optional[float] = None
    speaking: Optional[float] = None
    full_test: Optional[float] = None 

class StreakInfo(BaseModel):
    current_streak: int      
    activity_map: List[bool] 

# =================================================================
# RESPONSE SCHEMAS FOR MICRO-ENDPOINTS APTIS
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