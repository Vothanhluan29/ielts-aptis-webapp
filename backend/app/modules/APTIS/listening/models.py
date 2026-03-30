from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import JSON
import enum
from app.core.database import Base

# Enum trạng thái bài làm
class AptisListeningStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GRADED = "GRADED"

# ==========================================
# 1. TEST (Đề thi - Tổng 25 câu)
# ==========================================
class AptisListeningTest(Base):
    __tablename__ = "aptis_listening_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit = Column(Integer, default=40)  # Có thể set 40 phút cho Listening
    is_published = Column(Boolean, default=False)  
    is_full_test_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Quan hệ
    parts = relationship("AptisListeningPart", back_populates="test", cascade="all, delete-orphan", order_by="AptisListeningPart.part_number")
    submissions = relationship("AptisListeningSubmission", back_populates="test", cascade="all, delete-orphan")


# ==========================================
# 2. PART (Phần thi - Gồm 3 Part, chỉ làm vỏ bọc phân loại)
# ==========================================
class AptisListeningPart(Base):
    __tablename__ = "aptis_listening_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("aptis_listening_tests.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)  # Thêm title cho Part để dễ quản lý, có thể dùng để hiển thị trên UI
    part_number = Column(Integer)  # 1, 2, 3
    
    
    # Quan hệ
    test = relationship("AptisListeningTest", back_populates="parts")
    groups = relationship("AptisListeningQuestionGroup", back_populates="part", cascade="all, delete-orphan", order_by="AptisListeningQuestionGroup.order")


# ==========================================
# 3. GROUP (Nhóm câu hỏi - Nơi chứa Audio & Transcript thực thụ)
# ==========================================
class AptisListeningQuestionGroup(Base):
    __tablename__ = "aptis_listening_question_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("aptis_listening_parts.id", ondelete="CASCADE"), nullable=False)
    
    instruction = Column(Text, nullable=True)        
    image_url = Column(String(255), nullable=True) 
    
    # 🟢 AUDIO VÀ TRANSCRIPT ĐƯỢC CHUYỂN XUỐNG ĐÂY
    # - Part 1: Sẽ có ~13 Groups, mỗi Group chứa 1 Audio ngắn + 1 Question.
    # - Part 2 & 3: Sẽ chỉ có 1 Group, chứa 1 Audio dài + nhiều Questions.
    audio_url = Column(String(255), nullable=True) 
    transcript = Column(Text, nullable=True)
    
    order = Column(Integer, default=1)

    # Quan hệ
    part = relationship("AptisListeningPart", back_populates="groups")
    questions = relationship("AptisListeningQuestion", back_populates="group", cascade="all, delete-orphan", order_by="AptisListeningQuestion.question_number")


# ==========================================
# 4. QUESTION (Câu hỏi lẻ)
# ==========================================
class AptisListeningQuestion(Base):
    __tablename__ = "aptis_listening_questions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("aptis_listening_question_groups.id", ondelete="CASCADE"), nullable=False)
    
    question_number = Column(Integer) 
    question_text = Column(Text, nullable=True) 
    question_type = Column(String(50), nullable=False) # VD: MULTIPLE_CHOICE
    
    # JSON lưu dictionary: {"A": "Option 1", "B": "Option 2", "C": "Option 3"}
    options = Column(JSON, nullable=True) 
    correct_answer = Column(String(255), nullable=False) # VD: "B"
    explanation = Column(Text, nullable=True)
    audio_url = Column(String(255), nullable=True)
    # Quan hệ
    group = relationship("AptisListeningQuestionGroup", back_populates="questions")


# ==========================================
# 5. SUBMISSION (Bài nộp & Điểm CEFR)
# ==========================================
class AptisListeningSubmission(Base):
    __tablename__ = "aptis_listening_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("aptis_listening_tests.id", ondelete="CASCADE"), nullable=False)
    
    # JSON lưu đáp án của user: {"id_cau_1": "A", "id_cau_2": "C"}
    user_answers = Column(JSON, nullable=False) 
    
    # 🔥 CƠ CHẾ ĐIỂM SỐ MỚI DÀNH RIÊNG CHO APTIS
    correct_count = Column(Integer, default=0) # Số câu đúng (Max 25)
    score = Column(Integer, default=0)         # Điểm hệ số (thường bằng correct_count)
    cefr_level = Column(String(10), nullable=True) # A1, A2, B1, B2, C
    
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default=AptisListeningStatus.IN_PROGRESS.value)
    is_full_test_only = Column(Boolean, default=False)

    # Quan hệ
    test = relationship("AptisListeningTest", back_populates="submissions")
    user = relationship("User")