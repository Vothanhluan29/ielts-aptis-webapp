from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# --- ENUM TRẠNG THÁI CHUNG ---
class ExamStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED" # Chưa bắt đầu
    IN_PROGRESS = "IN_PROGRESS" # Đang làm bài (chung)
    COMPLETED = "COMPLETED"     # Đã nộp toàn bộ
    EXPIRED = "EXPIRED"         # Hết giờ tổng

# --- ✅ [MỚI] ENUM CÁC BƯỚC (STEP) ---

class ExamStep(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED" # Vừa bấm Start, hiển thị màn hình hướng dẫn chung
    LISTENING = "LISTENING"     # Đang trong màn hình Listening
    READING = "READING"         # Đang trong màn hình Reading
    WRITING = "WRITING"         # Đang trong màn hình Writing
    SPEAKING = "SPEAKING"       # Đang trong màn hình Speaking
    FINISHED = "FINISHED"       # Đã hoàn thành tất cả

# =======================================================
# 1. CẤU TRÚC ĐỀ THI FULL (CONTAINER)
# =======================================================
class FullTest(Base):
    __tablename__ = "full_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    
    # ID các đề con (Mock Only)
    reading_test_id = Column(Integer, ForeignKey("reading_tests.id"), nullable=True)
    listening_test_id = Column(Integer, ForeignKey("listening_tests.id"), nullable=True)
    writing_test_id = Column(Integer, ForeignKey("writing_tests.id"), nullable=True)
    speaking_test_id = Column(Integer, ForeignKey("speaking_tests.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reading_test = relationship("ReadingTest", foreign_keys=[reading_test_id])
    listening_test = relationship("ListeningTest", foreign_keys=[listening_test_id])
    writing_test = relationship("WritingTest", foreign_keys=[writing_test_id])
    speaking_test = relationship("SpeakingTest", foreign_keys=[speaking_test_id])
    
    submissions = relationship("ExamSubmission", back_populates="full_test", cascade="all, delete-orphan")

# =======================================================
# 2. BÀI LÀM FULL TEST (USER ATTEMPT)
# =======================================================
class ExamSubmission(Base):
    __tablename__ = "exam_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_test_id = Column(Integer, ForeignKey("full_tests.id", ondelete="CASCADE"), nullable=False)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Trạng thái tổng quan
    status = Column(String, default=ExamStatus.IN_PROGRESS.value)

    # ✅ [MỚI] TRẠNG THÁI CHI TIẾT (STEP)
    # Lưu bước hiện tại để Frontend biết redirect vào đâu
    current_step = Column(String, default=ExamStep.NOT_STARTED.value)

    # IDs các bài nộp thành phần
    reading_submission_id = Column(Integer, ForeignKey("reading_submissions.id"), nullable=True)
    listening_submission_id = Column(Integer, ForeignKey("listening_submissions.id"), nullable=True)
    writing_submission_id = Column(Integer, ForeignKey("writing_submissions.id"), nullable=True)
    speaking_submission_id = Column(Integer, ForeignKey("speaking_submissions.id"), nullable=True)

    # Điểm tổng kết
    overall_score = Column(Float, default=0.0) 

    # Relationships
    user = relationship("User", backref="exam_submissions")
    full_test = relationship("FullTest", back_populates="submissions")
    
    reading_submission = relationship("ReadingSubmission", foreign_keys=[reading_submission_id])
    listening_submission = relationship("ListeningSubmission", foreign_keys=[listening_submission_id])
    writing_submission = relationship("WritingSubmission", foreign_keys=[writing_submission_id])
    speaking_submission = relationship("SpeakingSubmission", foreign_keys=[speaking_submission_id])