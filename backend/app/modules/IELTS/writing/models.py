from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean, JSON, Enum as SqlEnum
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
import enum
from app.core.database import Base 

# --- ENUMS ---
class WritingTaskType(str, enum.Enum):
    TASK_1 = "TASK_1" 
    TASK_2 = "TASK_2" 

class WritingStatus(str, enum.Enum):
    PENDING = "PENDING"   
    GRADING = "GRADING"   
    GRADED = "GRADED"     
    ERROR = "ERROR"      



class WritingTest(Base):
    __tablename__ = "writing_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    time_limit = Column(Integer, default=60) 
    
    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tasks = relationship("WritingTask", back_populates="test", cascade="all, delete-orphan", order_by="WritingTask.task_type")
    submissions = relationship("WritingSubmission", back_populates="test", cascade="all, delete-orphan")

class WritingTask(Base):
    __tablename__ = "writing_tasks"

    id = Column(Integer, primary_key=True, index=True)
  
    test_id = Column(Integer, ForeignKey("writing_tests.id", ondelete="CASCADE"), nullable=False)
    
    task_type = Column(String, nullable=False) 
    
    question_text = Column(Text, nullable=False)
    image_url = Column(String, nullable=True) 

    test = relationship("WritingTest", back_populates="tasks")

class WritingSubmission(Base):
    __tablename__ = "writing_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("writing_tests.id", ondelete="CASCADE"), nullable=False)
    

    task1_content = Column(Text, nullable=True)
    task2_content = Column(Text, nullable=True)
    
    task1_word_count = Column(Integer, default=0)
    task2_word_count = Column(Integer, default=0)


    score_t1_ta = Column(Float, nullable=True)
    score_t1_cc = Column(Float, nullable=True)
    score_t1_lr = Column(Float, nullable=True)
    score_t1_gra = Column(Float, nullable=True)
    score_t1_overall = Column(Float, nullable=True)
    
    feedback_t1 = Column(Text, nullable=True)
    correction_t1 = Column(JSON, nullable=True) 

   
    score_t2_tr = Column(Float, nullable=True)
    score_t2_cc = Column(Float, nullable=True)
    score_t2_lr = Column(Float, nullable=True)
    score_t2_gra = Column(Float, nullable=True)
    score_t2_overall = Column(Float, nullable=True)
    
    feedback_t2 = Column(Text, nullable=True)
    correction_t2 = Column(JSON, nullable=True)


    band_score = Column(Float, nullable=True) 
    overall_feedback = Column(Text, nullable=True) 
    
    status = Column(String, default=WritingStatus.PENDING.value)
    is_full_test_only = Column(Boolean, default=False)
    
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True), nullable=True)

    test = relationship("WritingTest", back_populates="submissions")
    user = relationship("User", backref=backref("writing_submissions", cascade="all, delete-orphan"))