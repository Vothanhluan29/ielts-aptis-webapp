from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import enum

# 1. Định nghĩa Enum loại kỹ năng (Phân biệt rõ bài lẻ và bài tổng hợp)
class SkillType(str, enum.Enum):
    READING = "READING"
    LISTENING = "LISTENING"
    WRITING = "WRITING"
    SPEAKING = "SPEAKING"
    FULLTEST = "FULLTEST"  # Dùng để phân biệt bài thi Full Mock Test

# 2. Thống kê từng kỹ năng lẻ
class SkillStats(BaseModel):
    skill: SkillType
    average_score: float = 0.0
    total_tests: int = 0

# 3. Thống kê Full Mock Test
class FullTestStats(BaseModel):
    total_exams: int = 0         
    average_overall: float = 0.0 
    highest_overall: float = 0.0 

# 4. Chi tiết một hoạt động (ActivityItem)
class ActivityItem(BaseModel):
    id: int               # ID của bài nộp (Submission ID)
    type: SkillType       # Loại: READING, WRITING... hoặc FULLTEST
    title: str            # Tên đề thi (VD: "IELTS Mock Test 01")
    score: Optional[float] = None  # Điểm số
    date: datetime        # Ngày hoàn thành

# 5. Dữ liệu vẽ biểu đồ (Chart Data Point)
class ChartDataPoint(BaseModel):
    date: str             # Ngày tháng, VD: "15/01"
    reading: Optional[float] = None
    listening: Optional[float] = None
    writing: Optional[float] = None
    speaking: Optional[float] = None
    full_test: Optional[float] = None # Line riêng cho bài thi tổng hợp

# 6. Thông tin chuỗi ngày học tập (Streak)
class StreakInfo(BaseModel):
    current_streak: int      # Số ngày học liên tiếp
    activity_map: List[bool] # Mảng trạng thái 7 ngày qua (True/False)


# =================================================================
# 🚀 CÁC RESPONSE SCHEMAS CHO KIẾN TRÚC MICRO-ENDPOINTS
# =================================================================

# Response cho API 1: Các con số tổng quan (Overview - 4 ô Widget trên cùng)
class OverviewStatsResponse(BaseModel):
    full_test_stats: FullTestStats
    skill_stats: List[SkillStats]
    
    class Config:
        from_attributes = True

# Response cho API 2: Dữ liệu vẽ biểu đồ và Streak (Progress - Biểu đồ ở giữa)
class ProgressResponse(BaseModel):
    chart_data: List[ChartDataPoint]
    streak_info: StreakInfo
    
    class Config:
        from_attributes = True

# 🔥 ĐÃ BỔ SUNG: Response cho API 3: Danh sách hoạt động (Recent Activities - Cột bên phải/bên dưới)
class RecentActivitiesResponse(BaseModel):
    activities: List[ActivityItem]
    
    class Config:
        from_attributes = True