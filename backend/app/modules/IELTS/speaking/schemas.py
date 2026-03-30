from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Union, Dict
from datetime import datetime
from enum import Enum
import json

# --- ENUM ---
class SpeakingStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    GRADING = "GRADING"
    GRADED = "GRADED"
    ERROR = "ERROR"

# ==================== 0. HELPER SCHEMAS ====================

# Schema cho lỗi sửa (Correction)
class AIErrorItem(BaseModel):
    text: str           # Từ sai
    fix: str            # Từ sửa
    type: str           # grammar / vocabulary / pronunciation / minor_slip / excellent_vocab
    explanation: Optional[str] = None

# ==================== 1. QUESTIONS (Câu hỏi lẻ) - MỚI ====================
class SpeakingQuestionBase(BaseModel):
    question_text: str
    audio_question_url: Optional[str] = None
    sort_order: int = 1

class SpeakingQuestionCreate(SpeakingQuestionBase):
    pass

class SpeakingQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    audio_question_url: Optional[str] = None
    sort_order: Optional[int] = None

class SpeakingQuestionResponse(SpeakingQuestionBase):
    id: int
    part_id: int
    
    class Config:
        from_attributes = True

# ==================== 2. PARTS (Cấu phần đề thi) ====================
class SpeakingPartBase(BaseModel):
    part_number: int
    instruction: Optional[str] = None
    cue_card: Optional[str] = None

class SpeakingPartCreate(SpeakingPartBase):
    questions: List[SpeakingQuestionCreate] # Một Part chứa nhiều Question

class SpeakingPartUpdate(BaseModel):
    part_number: Optional[int] = None
    instruction: Optional[str] = None
    cue_card: Optional[str] = None
    questions: Optional[List[SpeakingQuestionCreate]] = None

class SpeakingPartResponse(SpeakingPartBase):
    id: int
    test_id: int
    questions: List[SpeakingQuestionResponse] = [] # Trả về danh sách câu hỏi
    
    class Config:
        from_attributes = True

# ==================== 3. TEST (Đề thi) ====================
class SpeakingTestBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 15
    is_published: bool = False
    is_full_test_only: bool = False

class SpeakingTestCreate(SpeakingTestBase):
    parts: List[SpeakingPartCreate]

class SpeakingTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    is_published: Optional[bool] = None
    is_full_test_only: Optional[bool] = None
    parts: Optional[List[SpeakingPartCreate]] = None 

class SpeakingTestResponse(SpeakingTestBase):
    id: int
    created_at: datetime
    parts: List[SpeakingPartResponse]
    
    class Config:
        from_attributes = True

# Schema danh sách rút gọn
class SpeakingTestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    time_limit: int
    is_published: bool
    is_full_test_only: bool 
    created_at: datetime
    status: Optional[str] = "NOT_STARTED"
    
    class Config:
        from_attributes = True

# ==================== 4. SUBMISSION INPUT (User Nộp bài) ====================

# 🔥 CẬP NHẬT: Học viên giờ nộp bài theo TỪNG CÂU HỎI (question_id) thay vì part_number
class SaveSpeakingQuestionRequest(BaseModel):
    test_id: int
    question_id: int       # ID của câu hỏi đang trả lời
    audio_url: str         # URL file đã upload
    submission_id: Optional[int] = None 
    is_full_test_only: bool = False

# ==================== 5. SUBMISSION OUTPUT ====================

# 🔥 CẬP NHẬT: Kết quả chi tiết TỪNG CÂU TRẢ LỜI
class SpeakingQuestionAnswerResponse(BaseModel):
    id: int
    question_id: int
    audio_url: str
    
    # Dữ liệu AI trả về
    transcript: Optional[str] = None
    feedback: Optional[str] = None
    
    # Điểm số thành phần
    score_fluency: Optional[float] = None
    score_lexical: Optional[float] = None
    score_grammar: Optional[float] = None
    score_pronunciation: Optional[float] = None
    
    # Danh sách lỗi (Tự động parse JSON string nếu Database trả về Text thay vì JSON)
    correction: Optional[List[AIErrorItem]] = None

    # (Tùy chọn) Kèm theo thông tin câu hỏi để UI dễ hiển thị
    question: Optional[SpeakingQuestionResponse] = None

    @field_validator('correction', mode='before')
    @classmethod 
    def parse_correction(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v

    class Config:
        from_attributes = True

# Kết quả TỔNG QUÁT
class SpeakingSubmissionResponse(BaseModel):
    id: int
    test_id: int
    user_id: int
    
    status: str
    is_full_test_only: bool
    submitted_at: datetime
    graded_at: Optional[datetime] = None

    # Điểm tổng kết
    band_score: Optional[float] = None
    score_fluency: Optional[float] = None
    score_lexical: Optional[float] = None
    score_grammar: Optional[float] = None
    score_pronunciation: Optional[float] = None
    
    # Nhận xét chung
    overall_feedback: Optional[str] = None

    # 🔥 ĐÃ SỬA: Chi tiết từng câu trả lời
    answers: List[SpeakingQuestionAnswerResponse] = []
    
    # Thông tin đề thi
    test: Optional[SpeakingTestResponse] = None

    class Config:
        from_attributes = True

# ==================== 6. ADMIN MANAGEMENT SCHEMAS ====================
class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdminSpeakingSubmissionResponse(SpeakingSubmissionResponse):
    user: Optional[UserBasicInfo] = None

