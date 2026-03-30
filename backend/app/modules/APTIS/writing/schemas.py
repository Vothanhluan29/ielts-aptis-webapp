from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import json

# --- ENUMS ---
class AptisWritingPartType(str, Enum):
    PART_1 = "PART_1"
    PART_2 = "PART_2"
    PART_3 = "PART_3"
    PART_4 = "PART_4"

# 🔥 Đã xóa GRADING và ERROR vì chuyển sang chấm thủ công
class SubmissionStatus(str, Enum):
    PENDING = "PENDING"
    GRADED = "GRADED"

# ==================== 1. CẤU TRÚC CÂU HỎI (QUESTIONS) ====================

class QuestionBase(BaseModel):
    question_text: str
    order_number: int = 1
    sub_type: Optional[str] = None  # "informal" hoặc "formal" cho Part 4

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int
    part_id: int

    class Config:
        from_attributes = True 

# ==================== 2. QUẢN LÝ ĐỀ THI (PARTS & TESTS) ====================

class PartBase(BaseModel):
    part_number: int
    part_type: AptisWritingPartType
    instruction: Optional[str] = None
    image_url: Optional[str] = None

class PartCreate(PartBase):
    questions: List[QuestionCreate] 

class PartResponse(PartBase):
    id: int
    test_id: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class WritingTestBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 50 
    is_published: bool = False
    is_full_test_only: bool = False 

class WritingTestCreate(WritingTestBase):
    parts: List[PartCreate] 

class WritingTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    is_published: Optional[bool] = None
    is_full_test_only: Optional[bool] = None
    parts: Optional[List[PartCreate]] = None 

class WritingTestResponse(WritingTestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    parts: List[PartResponse]

    class Config:
        from_attributes = True

class WritingTestListItem(BaseModel):
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

# ==================== 3. NỘP BÀI & KẾT QUẢ (SUBMISSIONS) ====================

class SubmitWriting(BaseModel):
    test_id: int
    user_answers: Dict[str, str]  # Key: question_id, Value: Student response
    is_full_test_only: bool = False

class WritingTestSimpleResponse(BaseModel):
    id: int
    title: str
    time_limit: int
    parts: List[PartResponse] 

    class Config:
        from_attributes = True

class WritingSubmissionResponse(BaseModel):
    id: int
    test_id: int
    user_id: int  
    user_answers: Dict[str, Any]
    
    # 🔥 THAY ĐỔI: Sử dụng teacher_feedback thay cho ai_feedback
    teacher_feedback: Optional[Dict[str, Any]] = None 
    overall_feedback: Optional[str] = None
    score: int 
    cefr_level: Optional[str]
    status: SubmissionStatus
    
    # 🔥 THÊM: ID của người chấm bài
    graded_by: Optional[int] = None
    
    submitted_at: datetime
    graded_at: Optional[datetime] = None

    @validator('user_answers', 'teacher_feedback', pre=True, always=True)
    def parse_json(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return {}
        return v

    class Config:
       from_attributes = True


class SubmissionHistoryItem(BaseModel):
    id: int
    test_id: int
    test: Optional[WritingTestSimpleResponse] = None
    status: str
    is_full_test_only: bool
    score: int
    cefr_level: Optional[str]
    submitted_at: datetime
    graded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==================== 4. ADMIN MANAGEMENT SCHEMAS ====================

class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True
        
class WritingSubmissionDetailResponse(WritingSubmissionResponse):
    user: Optional[UserBasicInfo] = None
    test: Optional[WritingTestResponse] = None # Trả về cả bộ đề (parts, questions)
    grader: Optional[UserBasicInfo] = None

    class Config:
        from_attributes = True


class AdminWritingSubmissionResponse(WritingSubmissionResponse):
    user: Optional[UserBasicInfo] = None
    grader: Optional[UserBasicInfo] = None  # 🔥 THÊM: Trả về thông tin Admin/Giáo viên đã chấm bài
    test: Optional[WritingTestSimpleResponse] = None
# 🔥 ĐỔI TÊN VÀ CẬP NHẬT: Dùng cho Giáo viên/Admin gửi điểm và nhận xét lên server
class WritingGradeRequest(BaseModel):
    score: int                 # Điểm tổng (Scale 50)
    cefr_level: str            # CEFR Level (A1, A2, B1, B2, C)
    teacher_feedback: Optional[Dict[str, Any]] = None  # Nhận xét chi tiết cho từng Part (JSON)
    overall_feedback: Optional[str] = None             # Nhận xét chung toàn bài