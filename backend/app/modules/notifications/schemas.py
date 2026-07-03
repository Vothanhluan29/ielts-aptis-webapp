from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "INFO"

class NotificationCreate(NotificationBase):
    student_id: int

class NotificationResponse(NotificationBase):
    id: UUID
    student_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
