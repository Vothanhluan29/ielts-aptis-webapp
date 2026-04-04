from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from sqlalchemy.types import JSON # Dùng JSON chung để tương thích cả MySQL/Postgres/SQLite
import enum
from app.core.database import Base

# Enum trạng thái
class ListeningStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GRADED = "GRADED"

class ListeningQuestionType(str, enum.Enum):
    # 1. Trắc nghiệm
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"          # Trắc nghiệm chọn 1 đáp án (A, B, C)
    MULTIPLE_ANSWER = "MULTIPLE_ANSWER"          # Chọn 2-3 đáp án từ 1 list (A-E / A-G)
    
    # 2. Nối thông tin (Map, Plan, Diagram, Matching)
    MATCHING = "MATCHING"                        # Nối tên người/sự vật với đặc điểm
    MAP_PLAN_LABELING = "MAP_PLAN_LABELING"      # Điền nhãn Bản đồ/Sơ đồ (thường nối với A, B, C trên ảnh)
    DIAGRAM_LABELING = "DIAGRAM_LABELING"        # Điền nhãn Sơ đồ máy móc/quy trình
    
    # 3. Điền từ vào chỗ trống (Fill in the blanks) - Chiếm >50% bài thi
    FORM_COMPLETION = "FORM_COMPLETION"          # Điền form đăng ký (Tên, SĐT, Địa chỉ) - Thường Part 1
    NOTE_COMPLETION = "NOTE_COMPLETION"          # Điền Note bài giảng - Thường Part 4
    TABLE_COMPLETION = "TABLE_COMPLETION"        # Điền bảng biểu thống kê
    FLOWCHART_COMPLETION = "FLOWCHART_COMPLETION"# Điền lưu đồ các bước thực hiện
    SUMMARY_COMPLETION = "SUMMARY_COMPLETION"    # Điền đoạn tóm tắt
    SENTENCE_COMPLETION = "SENTENCE_COMPLETION"  # Hoàn thành câu
    SHORT_ANSWER = "SHORT_ANSWER"                # Trả lời câu hỏi ngắn (NO MORE THAN 3 WORDS)

# 1. TEST (Đề thi)
class ListeningTest(Base):
    __tablename__ = "listening_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)  # 🔥 Thêm description ở đây
    
    time_limit = Column(Integer, default=40)  # Listening thường 30p làm bài + 10p transfer
    is_published = Column(Boolean, default=False)  
    is_full_test_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) # Đồng bộ với Reading

    # Quan hệ
    parts = relationship("ListeningPart", back_populates="test", cascade="all, delete-orphan", order_by="ListeningPart.part_number")
    submissions = relationship("ListeningSubmission", back_populates="test", cascade="all, delete-orphan")

# 2. PART
class ListeningPart(Base):
    __tablename__ = "listening_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("listening_tests.id"), nullable=False)
    
    part_number = Column(Integer)     # 1, 2, 3, 4
    audio_url = Column(String, nullable=False) # Link file MP3
    transcript = Column(Text, nullable=True)   # Lời thoại (Tapescript)
    
    test = relationship("ListeningTest", back_populates="parts")
    # Part chứa nhiều Groups
    groups = relationship("ListeningQuestionGroup", back_populates="part", cascade="all, delete-orphan", order_by="ListeningQuestionGroup.order")

# 3. GROUP
class ListeningQuestionGroup(Base):
    __tablename__ = "listening_question_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("listening_parts.id"), nullable=False)
    
    instruction = Column(Text)        
    image_url = Column(String, nullable=True) # Rất quan trọng cho dạng Map Labeling
    order = Column(Integer, default=1)

    part = relationship("ListeningPart", back_populates="groups")
    questions = relationship("ListeningQuestion", back_populates="group", cascade="all, delete-orphan", order_by="ListeningQuestion.question_number")

# 4. QUESTION
class ListeningQuestion(Base):
    __tablename__ = "listening_questions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("listening_question_groups.id"), nullable=False)
    
    question_number = Column(Integer) 
    question_text = Column(Text, nullable=True) 
    question_type = Column(String, nullable=False) 
    
    options = Column(JSON, nullable=True) 
    
    # 🔥 FIX QUAN TRỌNG: Sửa String thành JSON để chứa mảng các đáp án hợp lệ
    correct_answers = Column(JSON, nullable=False) 
    
    explanation = Column(Text, nullable=True)

    group = relationship("ListeningQuestionGroup", back_populates="questions")

# 5. SUBMISSION (Kết quả thi)
class ListeningSubmission(Base):
    __tablename__ = "listening_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("listening_tests.id"), nullable=False)
    
    user_answers = Column(JSON, nullable=False) 
    band_score = Column(Float, default=0.0)
    correct_count = Column(Integer, default=0)
    
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default=ListeningStatus.IN_PROGRESS.value)
    is_full_test_only = Column(Boolean, default=False)

    test = relationship("ListeningTest", back_populates="submissions")
    user = relationship("User", backref=backref("listening_submissions", cascade="all, delete-orphan"))