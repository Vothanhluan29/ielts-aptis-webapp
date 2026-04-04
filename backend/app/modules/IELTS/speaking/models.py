from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean, JSON, Enum as SqlEnum
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
import enum
from app.core.database import Base # Nhớ điều chỉnh đường dẫn import Base cho khớp project của bạn

# --- ENUM TRẠNG THÁI ---
class SpeakingStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS" 
    SUBMITTED = "SUBMITTED" 
    GRADING = "GRADING"    
    GRADED = "GRADED"  
    ERROR = "ERROR"        

# --- 1. ĐỀ THI SPEAKING ---
class SpeakingTest(Base):
    __tablename__ = "speaking_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False) 
    description = Column(Text, nullable=True)
    
    time_limit = Column(Integer, default=15) 
    
    is_published = Column(Boolean, default=False)
    is_full_test_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (ORM Cascade)
    parts = relationship("SpeakingPart", back_populates="test", cascade="all, delete-orphan", order_by="SpeakingPart.part_number")
    submissions = relationship("SpeakingSubmission", back_populates="test", cascade="all, delete-orphan")

# --- 2. CÁC PHẦN CỦA ĐỀ THI (PART 1, 2, 3) ---
class SpeakingPart(Base):
    __tablename__ = "speaking_parts"

    id = Column(Integer, primary_key=True, index=True)
    # 🔥 THÊM ondelete="CASCADE"
    test_id = Column(Integer, ForeignKey("speaking_tests.id", ondelete="CASCADE"), nullable=False)
    
    part_number = Column(Integer, nullable=False) # 1, 2, hoặc 3
    
    instruction = Column(Text, nullable=True)
    cue_card = Column(Text, nullable=True)

    # Relationships
    test = relationship("SpeakingTest", back_populates="parts")
    questions = relationship("SpeakingQuestion", back_populates="part", cascade="all, delete-orphan", order_by="SpeakingQuestion.sort_order")

# --- 3. CHI TIẾT TỪNG CÂU HỎI ---
class SpeakingQuestion(Base):
    __tablename__ = "speaking_questions"

    id = Column(Integer, primary_key=True, index=True)
    # 🔥 THÊM ondelete="CASCADE"
    part_id = Column(Integer, ForeignKey("speaking_parts.id", ondelete="CASCADE"), nullable=False)
    
    question_text = Column(Text, nullable=False)
    audio_question_url = Column(String, nullable=True) 
    sort_order = Column(Integer, default=1)

    # Relationships
    part = relationship("SpeakingPart", back_populates="questions")
    answers = relationship("SpeakingQuestionAnswer", back_populates="question", cascade="all, delete-orphan")

# --- 4. BÀI NỘP TỔNG (SUMMARY) ---
class SpeakingSubmission(Base):
    __tablename__ = "speaking_submissions"

    id = Column(Integer, primary_key=True, index=True)
    # 🔥 THÊM ondelete="CASCADE" cho user và test
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("speaking_tests.id", ondelete="CASCADE"), nullable=False)
    
    # Điểm tổng kết
    score_fluency = Column(Float, nullable=True)      
    score_lexical = Column(Float, nullable=True)      
    score_grammar = Column(Float, nullable=True)      
    score_pronunciation = Column(Float, nullable=True)
    
    band_score = Column(Float, nullable=True)
    
    overall_feedback = Column(Text, nullable=True)
    status = Column(String, default=SpeakingStatus.IN_PROGRESS.value)
    
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True), nullable=True)
    is_full_test_only = Column(Boolean, default=False)

    # Relationships
    test = relationship("SpeakingTest", back_populates="submissions")
    user = relationship("User", backref=backref("speaking_submissions", cascade="all, delete-orphan"))
    answers = relationship("SpeakingQuestionAnswer", back_populates="submission", cascade="all, delete-orphan")

# --- 5. TRẢ LỜI & CHẤM ĐIỂM TỪNG CÂU HỎI ---
class SpeakingQuestionAnswer(Base):
    __tablename__ = "speaking_question_answers"

    id = Column(Integer, primary_key=True, index=True)
    # 🔥 THÊM ondelete="CASCADE" cho cả submission và question
    submission_id = Column(Integer, ForeignKey("speaking_submissions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("speaking_questions.id", ondelete="CASCADE"), nullable=False)
    
    audio_url = Column(String, nullable=False)    
    transcript = Column(Text, nullable=True)

    score_fluency = Column(Float, nullable=True)
    score_lexical = Column(Float, nullable=True)
    score_grammar = Column(Float, nullable=True)
    score_pronunciation = Column(Float, nullable=True)
    
    feedback = Column(Text, nullable=True) 
    correction = Column(JSON, nullable=True)

    # Relationships
    submission = relationship("SpeakingSubmission", back_populates="answers")
    question = relationship("SpeakingQuestion", back_populates="answers")