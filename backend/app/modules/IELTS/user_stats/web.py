from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.IELTS.user_stats import schemas, service

router = APIRouter(prefix="/stats", tags=["IELTS Dashboard & Statistics"])

# 1. API lấy các con số thống kê tổng quan (Rất nhẹ, load nhanh)
@router.get("/overview", response_model=schemas.OverviewStatsResponse)
def get_overview_stats(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):  
    """
    Lấy điểm số trung bình của Full Test và 4 kỹ năng lẻ (Reading, Listening, Writing, Speaking).
    """
    return service.UserStatsService.get_overview_stats(db, current_user.id)

# 2. API lấy dữ liệu vẽ biểu đồ và chuỗi ngày học
@router.get("/progress", response_model=schemas.ProgressResponse)
def get_progress_data(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Lấy dữ liệu 10 ngày gần nhất để vẽ biểu đồ và thông tin Streak (chuỗi ngày học).
    """
    return service.UserStatsService.get_progress_data(db, current_user.id)

# 🔥 ĐÃ SỬA: Đồng bộ response_model với Schema mới
# 3. API lấy danh sách hoạt động (Có tham số limit)
@router.get("/activities", response_model=schemas.RecentActivitiesResponse)
def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Lấy danh sách các bài thi/luyện tập gần nhất. Có thể truyền ?limit=20 để lấy nhiều hơn.
    """
    return service.UserStatsService.get_recent_activities(db, current_user.id, limit)