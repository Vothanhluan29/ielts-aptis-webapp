from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.modules.admin import schemas, service

router = APIRouter(prefix="/admin", tags=["Admin Control"])

@router.get("/stats", response_model=schemas.SystemStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    return service.AdminService.get_system_stats(db)