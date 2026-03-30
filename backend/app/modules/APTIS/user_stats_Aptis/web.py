from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user

from . import schemas, service

# Đã đổi prefix thành /aptis/stats để URL không trùng với IELTS
router = APIRouter(prefix="/aptis/stats", tags=["Aptis Dashboard & Statistics"])

# 1. Thêm chữ "aptis_" vào tên hàm
@router.get("/overview", response_model=schemas.AptisOverviewStatsResponse)
def aptis_get_overview_stats(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Lấy điểm số trung bình của Full Test và 5 kỹ năng lẻ (Grammar & Vocab, Reading, Listening, Writing, Speaking).
    Bao gồm cả CEFR cao nhất đạt được.
    """
    return service.AptisUserStatsService.get_overview_stats(db, current_user.id)

# 2. Thêm chữ "aptis_" vào tên hàm
@router.get("/progress", response_model=schemas.AptisProgressResponse)
def aptis_get_progress_data(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Lấy dữ liệu 10 ngày gần nhất để vẽ biểu đồ và thông tin Streak (chuỗi ngày học).
    """
    return service.AptisUserStatsService.get_progress_data(db, current_user.id)

# 3. Thêm chữ "aptis_" vào tên hàm
@router.get("/activities", response_model=List[schemas.ActivityItem])
def aptis_get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Lấy danh sách các bài thi/luyện tập Aptis gần nhất. Có thể truyền ?limit=20 để lấy nhiều hơn.
    """
    return service.AptisUserStatsService.get_recent_activities(db, current_user.id, limit)