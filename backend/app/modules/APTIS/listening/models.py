from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import JSON
import enum
from app.core.database import Base


class AptisListeningStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GRADED = "GRADED"

# ==========================================
# 1. TEST 
# ==========================================
class AptisListeningTest(Base):
    __tablename__ = "aptis_listening_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit = Column(Integer, default=40)  
    is_published = Column(Boolean, default=False)  
    is_full_test_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Quan hệ
    parts = relationship("AptisListeningPart", back_populates="test", cascade="all, delete-orphan", order_by="AptisListeningPart.part_number")
    submissions = relationship("AptisListeningSubmission", back_populates="test", cascade="all, delete-orphan")


# ==========================================
# 2. PART
# ==========================================
class AptisListeningPart(Base):
    __tablename__ = "aptis_listening_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("aptis_listening_tests.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)  
    part_number = Column(Integer)  
    
    
    # Quan hệ
    test = relationship("AptisListeningTest", back_populates="parts")
    groups = relationship("AptisListeningQuestionGroup", back_populates="part", cascade="all, delete-orphan", order_by="AptisListeningQuestionGroup.order")


# ==========================================
# 3. GROUP 
# ==========================================
class AptisListeningQuestionGroup(Base):
    __tablename__ = "aptis_listening_question_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("aptis_listening_parts.id", ondelete="CASCADE"), nullable=False)
    
    instruction = Column(Text, nullable=True)        
    image_url = Column(String(255), nullable=True) 

    audio_url = Column(String(255), nullable=True) 
    transcript = Column(Text, nullable=True)
    
    order = Column(Integer, default=1)


    part = relationship("AptisListeningPart", back_populates="groups")
    questions = relationship("AptisListeningQuestion", back_populates="group", cascade="all, delete-orphan", order_by="AptisListeningQuestion.question_number")


# ==========================================
# 4. QUESTION 
# ==========================================
class AptisListeningQuestion(Base):
    __tablename__ = "aptis_listening_questions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("aptis_listening_question_groups.id", ondelete="CASCADE"), nullable=False)
    
    question_number = Column(Integer) 
    question_text = Column(Text, nullable=True) 
    question_type = Column(String(50), nullable=False)

    options = Column(JSON, nullable=True) 
    correct_answer = Column(String(255), nullable=False) 
    explanation = Column(Text, nullable=True)
    audio_url = Column(String(255), nullable=True)
    
    group = relationship("AptisListeningQuestionGroup", back_populates="questions")


# ==========================================
# 5. SUBMISSION 
# ==========================================
class AptisListeningSubmission(Base):
    __tablename__ = "aptis_listening_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("aptis_listening_tests.id", ondelete="CASCADE"), nullable=False)

    user_answers = Column(JSON, nullable=False) 

    correct_count = Column(Integer, default=0) 
    score = Column(Integer, default=0)         
    cefr_level = Column(String(10), nullable=True) 
    
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default=AptisListeningStatus.IN_PROGRESS.value)
    is_full_test_only = Column(Boolean, default=False)

    # Quan hệ
    test = relationship("AptisListeningTest", back_populates="submissions")
    user = relationship("User")