from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.IELTS.user_stats import schemas, service

router = APIRouter(prefix="/stats", tags=["IELTS Dashboard & Statistics"])


@router.get("/overview", response_model=schemas.OverviewStatsResponse)
def get_overview_stats(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):  

    return service.UserStatsService.get_overview_stats(db, current_user.id)

@router.get("/progress", response_model=schemas.ProgressResponse)
def get_progress_data(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):

    return service.UserStatsService.get_progress_data(db, current_user.id)


@router.get("/activities", response_model=schemas.RecentActivitiesResponse)
def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):

    return service.UserStatsService.get_recent_activities(db, current_user.id, limit)