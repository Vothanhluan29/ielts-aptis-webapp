import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class FeedbackType(str, enum.Enum):
    FEEDBACK = "feedback"
    HELP = "help"

class FeedbackStatus(str, enum.Enum):
    PENDING = "pending"
    RESOLVED = "resolved"

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_type = Column(String, default=FeedbackType.FEEDBACK)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default=FeedbackStatus.PENDING)
    admin_response = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="feedbacks")
