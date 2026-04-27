from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class AptisWritingPartType(str, enum.Enum):
    PART_1 = "PART_1"
    PART_2 = "PART_2"
    PART_3 = "PART_3"
    PART_4 = "PART_4"


class AptisWritingStatus(str, enum.Enum):
    PENDING = "PENDING"
    GRADED = "GRADED"


class AptisWritingTest(Base):
    __tablename__ = "aptis_writing_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit = Column(Integer, default=50)

    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parts = relationship("AptisWritingPart", back_populates="test", cascade="all, delete-orphan", order_by="AptisWritingPart.part_number")
    submissions = relationship("AptisWritingSubmission", back_populates="test", cascade="all, delete-orphan")


class AptisWritingPart(Base):
    __tablename__ = "aptis_writing_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("aptis_writing_tests.id", ondelete="CASCADE"), nullable=False)

    part_number = Column(Integer, nullable=False)
    part_type = Column(String(50), nullable=False)

    instruction = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)

    test = relationship("AptisWritingTest", back_populates="parts")
    questions = relationship("AptisWritingQuestion", back_populates="part", cascade="all, delete-orphan", order_by="AptisWritingQuestion.order_number")


class AptisWritingQuestion(Base):
    __tablename__ = "aptis_writing_questions"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("aptis_writing_parts.id", ondelete="CASCADE"), nullable=False)

    question_text = Column(Text, nullable=False)
    order_number = Column(Integer, default=1)

    sub_type = Column(String(50), nullable=True)

    part = relationship("AptisWritingPart", back_populates="questions")


class AptisWritingSubmission(Base):
    __tablename__ = "aptis_writing_submissions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("aptis_writing_tests.id", ondelete="CASCADE"), nullable=False)

    user_answers = Column(JSON, nullable=False)

    teacher_feedback = Column(JSON, nullable=True)
    overall_feedback = Column(Text, nullable=True)
    is_full_test_only = Column(Boolean, default=False)

    score = Column(Integer, default=0)
    cefr_level = Column(String(10), nullable=True)
    status = Column(String(50), default=AptisWritingStatus.PENDING.value)

    graded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True), nullable=True)

    test = relationship("AptisWritingTest", back_populates="submissions")
    user = relationship("User", foreign_keys=[user_id])
    grader = relationship("User", foreign_keys=[graded_by])