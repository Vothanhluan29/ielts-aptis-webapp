from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class UserUsage(Base):
    __tablename__ = "user_usages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Speaking
    speaking_used = Column(Integer, default=0)
    speaking_limit = Column(Integer, default=3) 
    
    # Writing
    writing_used = Column(Integer, default=0)
    writing_limit = Column(Integer, default=3) 

    exam_used = Column(Integer, default=0)
    exam_limit = Column(Integer, default=1) 

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Quan hệ
    user = relationship("User", back_populates="usage")
    