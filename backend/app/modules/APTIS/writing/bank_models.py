from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.modules.APTIS.writing.models import AptisWritingPartType

class AptisWritingBankGroup(Base):
    __tablename__ = "aptis_writing_bank_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_type = Column(Enum(AptisWritingPartType), nullable=False)
    instruction = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    difficulty_level = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    questions = relationship(
        "AptisWritingBankQuestion",
        back_populates="bank_group",
        cascade="all, delete-orphan",
        order_by="AptisWritingBankQuestion.order_number"
    )


class AptisWritingBankQuestion(Base):
    __tablename__ = "aptis_writing_bank_questions"

    id = Column(Integer, primary_key=True, index=True)
    bank_group_id = Column(Integer, ForeignKey("aptis_writing_bank_groups.id", ondelete="CASCADE"), nullable=False)

    order_number = Column(Integer, default=1)
    question_text = Column(Text, nullable=False)
    sub_type = Column(String(50), nullable=True)

    bank_group = relationship("AptisWritingBankGroup", back_populates="questions")
