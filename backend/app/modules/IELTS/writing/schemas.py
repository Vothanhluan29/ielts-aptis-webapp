from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import json

# --- ENUMS ---
class WritingTaskType(str, Enum):
    TASK_1 = "TASK_1"
    TASK_2 = "TASK_2"

class SubmissionStatus(str, Enum):
    PENDING = "PENDING"
    GRADING = "GRADING" 
    GRADED = "GRADED"
    ERROR = "ERROR"

# ==================== 1. QUẢN LÝ ĐỀ THI (ADMIN) ====================

class TaskBase(BaseModel):
    task_type: WritingTaskType
    question_text: str
    image_url: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    test_id: int
    class Config: 
        from_attributes = True

class WritingTestBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 60
    is_published: bool = False
    is_full_test_only: bool = False 

class WritingTestCreate(WritingTestBase):
    tasks: List[TaskCreate] 

class WritingTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    is_published: Optional[bool] = None
    is_full_test_only: Optional[bool] = None
    tasks: Optional[List[TaskCreate]] = None 

class WritingTestResponse(WritingTestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[TaskResponse]
    class Config: 
        from_attributes = True

# Schema hiển thị danh sách dạng rút gọn
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

# ==================== 2. NỘP BÀI (STUDENT) ====================

class SubmitWriting(BaseModel):
    test_id: int
    submission_id: Optional[int] = None 
    task1_content: Optional[str] = ""
    task2_content: Optional[str] = ""
    is_full_test_only: bool = False

# ==================== 3. KẾT QUẢ & HIỂN THỊ ====================

# Schema định nghĩa cấu trúc 1 lỗi sai từ AI
class CorrectionItem(BaseModel):
    text: str       # Đoạn văn sai
    fix: str        # Đoạn sửa lại
    type: str       # grammar, vocabulary, minor_slip...
    explanation: Optional[str] = None

# Schema Test rút gọn nhúng trong Submission
class WritingTestSimpleResponse(BaseModel):
    id: int
    title: str
    time_limit: int
    tasks: List[TaskResponse] 
    class Config: 
        from_attributes = True

class WritingSubmissionResponse(BaseModel):
    id: int
    test_id: int
    user_id: int  
    is_full_test_only: bool = False
    
    # Bài làm
    task1_content: Optional[str] = ""
    task2_content: Optional[str] = ""
    task1_word_count: int = 0
    task2_word_count: int = 0
    
    # --- ĐIỂM SỐ & FEEDBACK TASK 1 ---
    score_t1_overall: Optional[float] = None
    score_t1_ta: Optional[float] = None
    score_t1_cc: Optional[float] = None
    score_t1_lr: Optional[float] = None
    score_t1_gra: Optional[float] = None
    feedback_t1: Optional[str] = None
    correction_t1: Optional[List[CorrectionItem]] = None 

    # --- ĐIỂM SỐ & FEEDBACK TASK 2 ---
    score_t2_overall: Optional[float] = None
    score_t2_tr: Optional[float] = None
    score_t2_cc: Optional[float] = None
    score_t2_lr: Optional[float] = None
    score_t2_gra: Optional[float] = None
    feedback_t2: Optional[str] = None
    correction_t2: Optional[List[CorrectionItem]] = None 

    # --- TỔNG KẾT ---
    band_score: Optional[float] = None
    overall_feedback: Optional[str] = None
    
    status: str
    submitted_at: datetime
    graded_at: Optional[datetime] = None

    test: Optional[WritingTestSimpleResponse] = None

    @field_validator('correction_t1', 'correction_t2', mode='before')
    @classmethod
    def parse_correction(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            try:
                # Nếu chuỗi rỗng thì trả về list rỗng
                if not v.strip(): return []
                parsed = json.loads(v)
                # Đảm bảo trả về list
                return parsed if isinstance(parsed, list) else []
            except Exception:
                return []
        return v if isinstance(v, list) else []

    class Config: 
        from_attributes = True


# ==================== 4. ADMIN MANAGEMENT SCHEMAS ====================

# Thông tin cơ bản của User
class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    class Config:
        from_attributes = True

# Kế thừa nguyên vẹn từ bản Student, chỉ kẹp thêm info của User
class AdminWritingSubmissionResponse(WritingSubmissionResponse):
    user: Optional[UserBasicInfo] = None