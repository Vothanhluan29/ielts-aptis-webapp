from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.users.models import User, UserRole
from app.modules.feedbacks import schemas, services

router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])

@router.post("/", response_model=schemas.FeedbackOut, status_code=status.HTTP_201_CREATED)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return services.create_feedback(db=db, feedback=feedback, user_id=current_user.id)

@router.get("/my", response_model=List[schemas.FeedbackOut])
def get_my_feedbacks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return services.get_feedbacks_by_user(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/", response_model=List[schemas.FeedbackOut])
def get_all_feedbacks(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return services.get_all_feedbacks(db=db, skip=skip, limit=limit, status=status)

@router.put("/{feedback_id}", response_model=schemas.FeedbackOut)
def update_feedback(
    feedback_id: int,
    feedback_update: schemas.FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    updated_feedback = services.update_feedback(db=db, feedback_id=feedback_id, feedback_update=feedback_update)
    if not updated_feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    
    return updated_feedback
