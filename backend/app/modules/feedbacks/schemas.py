from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.modules.feedbacks.models import FeedbackType, FeedbackStatus

class FeedbackBase(BaseModel):
    title: str
    description: str
    feedback_type: FeedbackType = FeedbackType.FEEDBACK

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    status: Optional[FeedbackStatus] = None
    admin_response: Optional[str] = None

class UserBrief(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: str
    role: str

    class Config:
        from_attributes = True

class FeedbackOut(FeedbackBase):
    id: int
    user_id: int
    user: Optional[UserBrief] = None
    status: FeedbackStatus
    admin_response: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
