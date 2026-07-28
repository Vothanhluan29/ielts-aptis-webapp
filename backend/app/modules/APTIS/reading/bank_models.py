from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AptisReadingBankGroup(Base):
    __tablename__ = "aptis_reading_bank_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(Integer, default=1)
    instruction = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    difficulty_level = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    questions = relationship(
        "AptisReadingBankQuestion",
        back_populates="bank_group",
        cascade="all, delete-orphan",
        order_by="AptisReadingBankQuestion.question_number"
    )

class AptisReadingBankQuestion(Base):
    __tablename__ = "aptis_reading_bank_questions"

    id = Column(Integer, primary_key=True, index=True)
    bank_group_id = Column(Integer, ForeignKey("aptis_reading_bank_groups.id"), index=True, nullable=False)

    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False)
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)

    bank_group = relationship("AptisReadingBankGroup", back_populates="questions")
