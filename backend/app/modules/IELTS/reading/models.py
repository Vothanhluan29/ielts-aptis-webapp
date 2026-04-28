from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class ReadingStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GRADED = "GRADED"


class ReadingQuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    MULTIPLE_ANSWER = "MULTIPLE_ANSWER"
    TRUE_FALSE_NOT_GIVEN = "TRUE_FALSE_NOT_GIVEN"
    YES_NO_NOT_GIVEN = "YES_NO_NOT_GIVEN"
    SENTENCE_COMPLETION = "SENTENCE_COMPLETION"
    SUMMARY_COMPLETION = "SUMMARY_COMPLETION"
    MATCHING_HEADINGS = "MATCHING_HEADINGS"
    MATCHING_FEATURES = "MATCHING_FEATURES"
    MATCHING_PARAGRAPH_INFORMATION = "MATCHING_PARAGRAPH_INFORMATION"


class ReadingTest(Base):
    __tablename__ = "reading_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    time_limit = Column(Integer, default=60)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    passages = relationship(
        "ReadingPassage",
        back_populates="test",
        cascade="all, delete-orphan",
        order_by="ReadingPassage.order",
    )
    submissions = relationship(
        "ReadingSubmission",
        back_populates="test",
        cascade="all, delete-orphan",
    )


class ReadingPassage(Base):
    __tablename__ = "reading_passages"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("reading_tests.id"), nullable=False)
    title = Column(String)
    content = Column(Text, nullable=False)
    order = Column(Integer, default=1)

    test = relationship("ReadingTest", back_populates="passages")
    groups = relationship(
        "ReadingQuestionGroup",
        back_populates="passage",
        cascade="all, delete-orphan",
        order_by="ReadingQuestionGroup.order",
    )


class ReadingQuestionGroup(Base):
    __tablename__ = "reading_question_groups"

    id = Column(Integer, primary_key=True, index=True)
    passage_id = Column(Integer, ForeignKey("reading_passages.id"), nullable=False)

    instruction = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    order = Column(Integer, default=0)

    passage = relationship("ReadingPassage", back_populates="groups")
    questions = relationship(
        "ReadingQuestion",
        back_populates="group",
        cascade="all, delete-orphan",
        order_by="ReadingQuestion.question_number",
    )


class ReadingQuestion(Base):
    __tablename__ = "reading_questions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("reading_question_groups.id"), nullable=False)

    question_number = Column(Integer, nullable=False)
    question_text = Column(Text)
    question_type = Column(String, nullable=False)
    options = Column(JSON, nullable=True)
    
    correct_answers = Column(JSON, nullable=False) 
    
    explanation = Column(Text, nullable=True)

    group = relationship("ReadingQuestionGroup", back_populates="questions")


class ReadingSubmission(Base):
    __tablename__ = "reading_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("reading_tests.id"), nullable=False)

    user_answers = Column(JSON, nullable=False)

    band_score = Column(Float, default=0.0)
    correct_count = Column(Integer, default=0)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default=ReadingStatus.IN_PROGRESS.value)
    is_full_test_only = Column(Boolean, default=False)

    test = relationship("ReadingTest", back_populates="submissions")
    user = relationship("User", backref=backref("reading_submissions", cascade="all, delete-orphan"))