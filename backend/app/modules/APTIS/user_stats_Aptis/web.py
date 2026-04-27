from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user

from . import schemas, service

router = APIRouter(prefix="/aptis/stats", tags=["Aptis Dashboard & Statistics"])


@router.get("/overview", response_model=schemas.AptisOverviewStatsResponse)
def aptis_get_overview_stats(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):

    return service.AptisUserStatsService.get_overview_stats(db, current_user.id)

# 2. Thêm chữ "aptis_" vào tên hàm
@router.get("/progress", response_model=schemas.AptisProgressResponse)
def aptis_get_progress_data(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):

    return service.AptisUserStatsService.get_progress_data(db, current_user.id)


@router.get("/activities", response_model=List[schemas.ActivityItem])
def aptis_get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):

    return service.AptisUserStatsService.get_recent_activities(db, current_user.id, limit)