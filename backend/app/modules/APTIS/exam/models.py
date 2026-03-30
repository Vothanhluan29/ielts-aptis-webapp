from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# --- ENUMS: ĐỊNH NGHĨA TRẠNG THÁI ---
class AptisExamStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"

class AptisExamStep(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    GRAMMAR_VOCAB = "GRAMMAR_VOCAB" # Bước 1: Core
    LISTENING = "LISTENING"         # Bước 2
    READING = "READING"             # Bước 3
    WRITING = "WRITING"             # Bước 4
    SPEAKING = "SPEAKING"           # Bước 5
    FINISHED = "FINISHED"

# =======================================================
# 1. BẢNG CẤU TRÚC ĐỀ THI (THE CONTAINER)
# =======================================================
class AptisFullTest(Base):
    __tablename__ = "aptis_full_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # 🔥 FIX QUAN TRỌNG: Ép kiểu nullable=False để DB luôn giữ giá trị 0/1
    is_published = Column(Boolean, default=False, nullable=False)

    # Foreign Keys trỏ tới các đề thi thành phần (SET NULL nếu đề lẻ bị xóa)
    grammar_vocab_test_id = Column(Integer, ForeignKey("aptis_grammar_vocab_tests.id", ondelete="SET NULL"), nullable=True)
    listening_test_id = Column(Integer, ForeignKey("aptis_listening_tests.id", ondelete="SET NULL"), nullable=True)
    reading_test_id = Column(Integer, ForeignKey("aptis_reading_tests.id", ondelete="SET NULL"), nullable=True)
    writing_test_id = Column(Integer, ForeignKey("aptis_writing_tests.id", ondelete="SET NULL"), nullable=True)
    speaking_test_id = Column(Integer, ForeignKey("aptis_speaking_tests.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships: Giúp truy xuất nhanh Title của đề con
    grammar_vocab_test = relationship("AptisGrammarVocabTest", foreign_keys=[grammar_vocab_test_id])
    listening_test = relationship("AptisListeningTest", foreign_keys=[listening_test_id])
    reading_test = relationship("AptisReadingTest", foreign_keys=[reading_test_id])
    writing_test = relationship("AptisWritingTest", foreign_keys=[writing_test_id])
    speaking_test = relationship("AptisSpeakingTest", foreign_keys=[speaking_test_id])
    
    submissions = relationship("AptisExamSubmission", back_populates="full_test", cascade="all, delete-orphan")


# =======================================================
# 2. BẢNG BÀI LÀM CỦA HỌC VIÊN (USER ATTEMPT)
# =======================================================
class AptisExamSubmission(Base):
    __tablename__ = "aptis_exam_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_test_id = Column(Integer, ForeignKey("aptis_full_tests.id", ondelete="CASCADE"), nullable=False)
    
    # Theo dõi tiến độ thi
    status = Column(String(50), default=AptisExamStatus.IN_PROGRESS.value)
    current_step = Column(String(50), default=AptisExamStep.GRAMMAR_VOCAB.value)

    # Lưu ID bài làm của từng kỹ năng (Lưu vết bài nộp lẻ)
    grammar_vocab_submission_id = Column(Integer, ForeignKey("aptis_grammar_vocab_submissions.id", ondelete="SET NULL"), nullable=True)
    listening_submission_id = Column(Integer, ForeignKey("aptis_listening_submissions.id", ondelete="SET NULL"), nullable=True)
    reading_submission_id = Column(Integer, ForeignKey("aptis_reading_submissions.id", ondelete="SET NULL"), nullable=True)
    writing_submission_id = Column(Integer, ForeignKey("aptis_writing_submissions.id", ondelete="SET NULL"), nullable=True)
    speaking_submission_id = Column(Integer, ForeignKey("aptis_speaking_submissions.id", ondelete="SET NULL"), nullable=True)

    # Kết quả tổng kết
    overall_score = Column(Integer, default=0) # Tổng điểm 250
    overall_cefr_level = Column(String(10), nullable=True) # A1, A2, B1, B2, C

    start_time = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="aptis_exam_submissions")
    full_test = relationship("AptisFullTest", back_populates="submissions")
    
    # Kết nối trực tiếp để lấy điểm từng phần nhanh chóng
    grammar_vocab_submission = relationship("AptisGrammarVocabSubmission", foreign_keys=[grammar_vocab_submission_id])
    listening_submission = relationship("AptisListeningSubmission", foreign_keys=[listening_submission_id])
    reading_submission = relationship("AptisReadingSubmission", foreign_keys=[reading_submission_id])
    writing_submission = relationship("AptisWritingSubmission", foreign_keys=[writing_submission_id])
    speaking_submission = relationship("AptisSpeakingSubmission", foreign_keys=[speaking_submission_id])