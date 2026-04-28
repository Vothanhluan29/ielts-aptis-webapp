from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import enum


class SkillType(str, enum.Enum):
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


class ActivityItem(BaseModel):
    id: int               
    type: SkillType       
    title: str           
    score: Optional[float] = None  
    date: datetime    


class ChartDataPoint(BaseModel):
    date: str             
    reading: Optional[float] = None
    listening: Optional[float] = None
    writing: Optional[float] = None
    speaking: Optional[float] = None
    full_test: Optional[float] = None 


class StreakInfo(BaseModel):
    current_streak: int     
    activity_map: List[bool]



class OverviewStatsResponse(BaseModel):
    full_test_stats: FullTestStats
    skill_stats: List[SkillStats]
    
    class Config:
        from_attributes = True


class ProgressResponse(BaseModel):
    chart_data: List[ChartDataPoint]
    streak_info: StreakInfo
    
    class Config:
        from_attributes = True


class RecentActivitiesResponse(BaseModel):
    activities: List[ActivityItem]
    
    class Config:
        from_attributes = True