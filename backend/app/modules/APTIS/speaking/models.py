from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class AptisSpeakingStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    PENDING = "PENDING"
    GRADED = "GRADED"


class AptisSpeakingTest(Base):
    __tablename__ = "aptis_speaking_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    time_limit = Column(Integer, default=12)

    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parts = relationship("AptisSpeakingPart", back_populates="test", cascade="all, delete-orphan", order_by="AptisSpeakingPart.part_number")
    submissions = relationship("AptisSpeakingSubmission", back_populates="test", cascade="all, delete-orphan")


class AptisSpeakingPart(Base):
    __tablename__ = "aptis_speaking_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("aptis_speaking_tests.id", ondelete="CASCADE"), nullable=False)

    part_number = Column(Integer, nullable=False)
    part_type = Column(String(50), nullable=False)

    instruction = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    image_url_2 = Column(String, nullable=True)

    test = relationship("AptisSpeakingTest", back_populates="parts")
    questions = relationship("AptisSpeakingQuestion", back_populates="part", cascade="all, delete-orphan", order_by="AptisSpeakingQuestion.order_number")


class AptisSpeakingQuestion(Base):
    __tablename__ = "aptis_speaking_questions"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("aptis_speaking_parts.id", ondelete="CASCADE"), nullable=False)

    order_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=True)
    audio_url = Column(String, nullable=True)

    prep_time = Column(Integer, default=0)
    response_time = Column(Integer, default=0)

    part = relationship("AptisSpeakingPart", back_populates="questions")


class AptisSpeakingSubmission(Base):
    __tablename__ = "aptis_speaking_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("aptis_speaking_tests.id", ondelete="CASCADE"), nullable=False)

    total_score = Column(Integer, nullable=True)
    cefr_level = Column(String(10), nullable=True)

    overall_feedback = Column(Text, nullable=True)
    status = Column(String, default=AptisSpeakingStatus.IN_PROGRESS.value)

    graded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True), nullable=True)
    is_full_test_only = Column(Boolean, default=False)

    test = relationship("AptisSpeakingTest", back_populates="submissions")
    answers = relationship("AptisSpeakingPartAnswer", back_populates="submission", cascade="all, delete-orphan", order_by="AptisSpeakingPartAnswer.part_number")

    user = relationship("User", foreign_keys=[user_id])
    grader = relationship("User", foreign_keys=[graded_by])


class AptisSpeakingPartAnswer(Base):
    __tablename__ = "aptis_speaking_part_answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("aptis_speaking_submissions.id", ondelete="CASCADE"), nullable=False)

    part_number = Column(Integer, nullable=False)
    audio_url = Column(String, nullable=False)

    transcript = Column(Text, nullable=True)

    part_score = Column(Integer, nullable=True)
    admin_feedback = Column(Text, nullable=True)

    submission = relationship("AptisSpeakingSubmission", back_populates="answers")