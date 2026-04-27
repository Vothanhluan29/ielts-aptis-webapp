from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
# Đổi JSONB thành JSON chung (hoặc bạn giữ JSONB nếu hệ thống chỉ dùng rặt PostgreSQL)
from sqlalchemy.types import JSON 
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# ==========================================
#ENUMS
# ==========================================
class AptisReadingStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GRADED = "GRADED"

# ==========================================
# 1. TEST 
# ==========================================
class AptisReadingTest(Base):
    __tablename__ = "aptis_reading_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit = Column(Integer, default=35) 
    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Quan hệ
    parts = relationship(
        "AptisReadingPart",
        back_populates="test",
        cascade="all, delete-orphan",
        order_by="AptisReadingPart.part_number",
    )
    submissions = relationship(
        "AptisReadingSubmission",
        back_populates="test",
        cascade="all, delete-orphan",
    )

# ==========================================
# 2. PART 
# ==========================================
class AptisReadingPart(Base):
    __tablename__ = "aptis_reading_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("aptis_reading_tests.id", ondelete="CASCADE"), nullable=False)
    
    part_number = Column(Integer, default=1) 
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=True) 

    # Quan hệ
    test = relationship("AptisReadingTest", back_populates="parts")
    groups = relationship(
        "AptisReadingQuestionGroup",
        back_populates="part",
        cascade="all, delete-orphan",
        order_by="AptisReadingQuestionGroup.order",
    )

# ==========================================
# 3. GROUP 
# ==========================================
class AptisReadingQuestionGroup(Base):
    __tablename__ = "aptis_reading_question_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("aptis_reading_parts.id", ondelete="CASCADE"), nullable=False)

    instruction = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    order = Column(Integer, default=0)

    # Quan hệ
    part = relationship("AptisReadingPart", back_populates="groups")
    questions = relationship(
        "AptisReadingQuestion",
        back_populates="group",
        cascade="all, delete-orphan",
        order_by="AptisReadingQuestion.question_number",
    )

# ==========================================
# 4. QUESTION 
# ==========================================
class AptisReadingQuestion(Base):
    __tablename__ = "aptis_reading_questions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("aptis_reading_question_groups.id", ondelete="CASCADE"), nullable=False)

    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False) 
    
    options = Column(JSON, nullable=True) 
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)

    group = relationship("AptisReadingQuestionGroup", back_populates="questions")

# ==========================================
# 5. SUBMISSION 
# ==========================================
class AptisReadingSubmission(Base):
    __tablename__ = "aptis_reading_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("aptis_reading_tests.id", ondelete="CASCADE"), nullable=False)

    user_answers = Column(JSON, nullable=False)

    correct_count = Column(Integer, default=0) 
    score = Column(Integer, default=0)       
    cefr_level = Column(String(10), nullable=True)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default=AptisReadingStatus.IN_PROGRESS.value)
    is_full_test_only = Column(Boolean, default=False)

    # Quan hệ
    test = relationship("AptisReadingTest", back_populates="submissions")
    user = relationship("User")