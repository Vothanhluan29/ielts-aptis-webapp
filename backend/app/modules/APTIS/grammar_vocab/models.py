from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

# =====================================================
# 1. ENUMS
# =====================================================
class AptisQuestionPart(str, enum.Enum):
    GRAMMAR = "GRAMMAR"
    VOCAB_WORD_DEFINITION = "VOCAB_WORD_DEFINITION"
    VOCAB_WORD_PAIRS = "VOCAB_WORD_PAIRS"
    VOCAB_WORD_USAGE = "VOCAB_WORD_USAGE"
    VOCAB_WORD_COMBINATIONS = "VOCAB_WORD_COMBINATIONS"

class AptisGrammarVocabStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    GRADED = "GRADED"

# =====================================================
# 2. TEST MODEL
# =====================================================
class AptisGrammarVocabTest(Base):
    __tablename__ = "aptis_grammar_vocab_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    time_limit = Column(Integer, default=25)  # minutes
    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False) 

    created_at = Column(DateTime, default=datetime.utcnow)

    # Cascade ensures questions/submissions are removed if test is deleted
    questions = relationship(
        "AptisGrammarVocabQuestion",
        back_populates="test",
        cascade="all, delete-orphan"
    )

    submissions = relationship(
        "AptisGrammarVocabSubmission",
        back_populates="test",
        cascade="all, delete-orphan"
    )

# =====================================================
# 3. QUESTION MODEL
# =====================================================
class AptisGrammarVocabQuestion(Base):
    __tablename__ = "aptis_grammar_vocab_questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(
        Integer,
        ForeignKey("aptis_grammar_vocab_tests.id", ondelete="CASCADE")
    )

    part_type = Column(Enum(AptisQuestionPart), nullable=False)
    question_number = Column(Integer)

    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)

    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text)

    test = relationship("AptisGrammarVocabTest", back_populates="questions")

# =====================================================
# 4. SUBMISSION MODEL
# =====================================================
class AptisGrammarVocabSubmission(Base):
    __tablename__ = "aptis_grammar_vocab_submissions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )

    test_id = Column(
        Integer,
        ForeignKey("aptis_grammar_vocab_tests.id", ondelete="CASCADE")
    )

    grammar_score = Column(Integer, default=0)
    vocab_score = Column(Integer, default=0)
    total_score = Column(Integer, default=0)

    # Đánh dấu bài nộp này thuộc thi lẻ hay thi Full Mock
    is_full_test_only = Column(Boolean, default=False)
    
    # Trạng thái bài nộp (Mặc định là GRADED vì chấm trắc nghiệm bằng thuật toán tức thì)
    status = Column(Enum(AptisGrammarVocabStatus), default=AptisGrammarVocabStatus.GRADED)

    # Raw answers submitted by the user (JSON)
    user_answers = Column(JSON, nullable=False)

    # Result after grading (JSON)
    answer_details = Column(JSON)

    submitted_at = Column(DateTime, default=datetime.utcnow)

    test = relationship("AptisGrammarVocabTest", back_populates="submissions")
    user = relationship("User") # Đảm bảo bạn có model User trong hệ thống