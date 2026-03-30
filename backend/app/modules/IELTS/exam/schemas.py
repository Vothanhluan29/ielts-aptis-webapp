from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

# --- ENUMS ---
class ExamStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED" # Trạng thái ảo để FE dễ filter
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"

class ExamStep(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    LISTENING = "LISTENING"
    READING = "READING"
    WRITING = "WRITING"
    SPEAKING = "SPEAKING"
    FINISHED = "FINISHED"

# =======================================================
# 0. SHARED SCHEMAS
# =======================================================
class ComponentTestSummary(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True

class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


# =======================================================
# 1. FULL TEST MANAGEMENT (ADMIN CRUD)
# =======================================================
class FullTestBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_published: bool = False
    
    # 🔥 NÂNG CẤP 1: Đưa 4 trường ID ra ngoài cùng để Frontend dễ dàng bind vào Form Edit
    listening_test_id: Optional[int] = None
    reading_test_id: Optional[int] = None
    writing_test_id: Optional[int] = None
    speaking_test_id: Optional[int] = None

class FullTestCreate(FullTestBase):
    pass # Kế thừa toàn bộ từ FullTestBase

class FullTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    listening_test_id: Optional[int] = None
    reading_test_id: Optional[int] = None
    writing_test_id: Optional[int] = None
    speaking_test_id: Optional[int] = None

class FullTestResponse(FullTestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Thông tin chi tiết các đề con được gán vào (để hiển thị Tooltip/Review)
    listening_test: Optional[ComponentTestSummary] = None
    reading_test: Optional[ComponentTestSummary] = None
    writing_test: Optional[ComponentTestSummary] = None
    speaking_test: Optional[ComponentTestSummary] = None

    class Config:
        from_attributes = True


# =======================================================
# 2. FULL TEST LIST (Dành cho trang danh sách có Filter)
# =======================================================
class FullTestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_published: bool
    created_at: datetime
    
    # 🔥 NÂNG CẤP 2: Bổ sung 4 trường ID để bảng Admin render được Tag Kỹ Năng
    listening_test_id: Optional[int] = None
    reading_test_id: Optional[int] = None
    writing_test_id: Optional[int] = None
    speaking_test_id: Optional[int] = None

    # Dữ liệu động theo từng User để làm Filter
    user_status: str = "NOT_STARTED"  # NOT_STARTED, IN_PROGRESS, COMPLETED
    current_step: str = "NOT_STARTED" 
    exam_submission_id: Optional[int] = None 

    class Config:
        from_attributes = True


# =======================================================
# 3. EXAM FLOW (USER ATTEMPT)
# =======================================================
class StartExamRequest(BaseModel):
    full_test_id: int

class ExamSubmissionResponse(BaseModel):
    id: int
    user_id: int
    full_test_id: int

    status: str
    current_step: str

    start_time: datetime
    completed_at: Optional[datetime] = None

    # ID các bài nộp thành phần
    listening_submission_id: Optional[int] = None
    reading_submission_id: Optional[int] = None
    writing_submission_id: Optional[int] = None
    speaking_submission_id: Optional[int] = None

    overall_score: Optional[float] = 0.0

    # Điểm số thành phần (để map nhanh từ các bảng lẻ)
    listening_score: Optional[float] = None
    reading_score: Optional[float] = None
    writing_score: Optional[float] = None
    speaking_score: Optional[float] = None

    full_test: Optional[FullTestResponse] = None

    class Config:
        from_attributes = True

class StepTransitionResponse(BaseModel):
    message: str
    next_step: str
    exam_submission_id: int

class SkillCompletionRequest(BaseModel):
    exam_submission_id: int
    current_step: str 
    skill_submission_id: int

# =======================================================
# 4. ADMIN MANAGEMENT
# =======================================================
class AdminExamSubmissionResponse(ExamSubmissionResponse):
    user: Optional[UserBasicInfo] = None