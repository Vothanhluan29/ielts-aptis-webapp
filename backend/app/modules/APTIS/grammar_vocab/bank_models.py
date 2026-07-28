from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.modules.APTIS.grammar_vocab.models import AptisQuestionPart

class AptisGrammarVocabBankGroup(Base):
    __tablename__ = "aptis_grammar_vocab_bank_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_type = Column(Enum(AptisQuestionPart), nullable=False)
    instruction = Column(Text, nullable=True)
    difficulty_level = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    questions = relationship(
        "AptisGrammarVocabBankQuestion",
        back_populates="bank_group",
        cascade="all, delete-orphan",
        order_by="AptisGrammarVocabBankQuestion.question_number"
    )

class AptisGrammarVocabBankQuestion(Base):
    __tablename__ = "aptis_grammar_vocab_bank_questions"

    id = Column(Integer, primary_key=True, index=True)
    bank_group_id = Column(Integer, ForeignKey("aptis_grammar_vocab_bank_groups.id", ondelete="CASCADE"), nullable=False)

    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=True)
    options = Column(JSON, nullable=True)
    correct_answer = Column(String(255), nullable=True)
    explanation = Column(Text, nullable=True)

    bank_group = relationship("AptisGrammarVocabBankGroup", back_populates="questions")
