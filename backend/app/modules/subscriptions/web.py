from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.subscriptions import schemas
from app.modules.subscriptions.service import SubscriptionService

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("/usage", response_model=schemas.UserUsageResponse)
def get_my_usage(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return SubscriptionService.get_or_create_usage(db, user.id)