from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS (Đã chuẩn hóa theo Aptis Reading) ====================
class AptisReadingQuestionType(str, Enum):
    FILL_IN_BLANKS = "FILL_IN_BLANKS"             # Điền từ (Part 1, Part 4)
    REORDER_SENTENCES = "REORDER_SENTENCES"       # Sắp xếp câu (Part 2)
    MATCHING_OPINIONS = "MATCHING_OPINIONS"       # Nối quan điểm người nói (Part 3)
    MATCHING_HEADINGS = "MATCHING_HEADINGS"       # Nối tiêu đề đoạn văn (Part 4)
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"           # Trắc nghiệm (Dự phòng)


# ==================== BASE MODELS ====================
class QuestionBase(BaseModel):
    question_number: int
    question_text: Optional[str] = None # Có thể null vì dạng nối heading chỉ cần số câu
    question_type: AptisReadingQuestionType
    
    # Options: Dùng dạng Dict cho an toàn {"A": "Apple", "B": "Banana"}
    # Dạng REORDER thì options chứa các câu cần sắp xếp.
    options: Optional[Union[Dict[str, Any], List[str], str]] = None

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v):
        import json
        if v is None: return {}
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, (dict, list)): return parsed
            except ValueError: pass
            return v
        return v

class QuestionGroupBase(BaseModel):
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0

# 🔴 Đổi Passage thành Part
class PartBase(BaseModel):
    part_number: int = 1
    title: Optional[str] = None
    # 🔥 Quan trọng: content được phép null vì Part 1 & 2 Aptis không có bài đọc dài
    content: Optional[str] = None 


# ==================== ADMIN INPUT (Create/Update) ====================
class QuestionCreateOrUpdate(QuestionBase):
    id: Optional[int] = None
    correct_answer: str
    explanation: Optional[str] = None

class QuestionGroupCreateOrUpdate(QuestionGroupBase):
    id: Optional[int] = None
    questions: List[QuestionCreateOrUpdate] = []

class PartCreateOrUpdate(PartBase):
    id: Optional[int] = None
    groups: List[QuestionGroupCreateOrUpdate] = []

class TestCreateOrUpdate(BaseModel):
    title: str
    description: Optional[str] = None # 🔥 ĐÃ THÊM: Cho phép Admin nhập mô tả khi tạo/sửa đề
    time_limit: int = 35 # Aptis Reading thường 35 phút
    is_published: bool = False
    is_full_test_only: bool = False
    parts: List[PartCreateOrUpdate] = []


# ==================== ADMIN RESPONSE ====================
class QuestionAdmin(QuestionCreateOrUpdate):
    id: int
    group_id: int
    class Config: from_attributes = True

class QuestionGroupAdmin(QuestionGroupBase):
    id: int
    part_id: int
    questions: List[QuestionAdmin]
    class Config: from_attributes = True

class PartAdmin(PartBase):
    id: int
    test_id: int
    groups: List[QuestionGroupAdmin]
    class Config: from_attributes = True

class TestAdmin(BaseModel):
    id: int
    title: str
    description: Optional[str] = None # 🔥 ĐÃ THÊM: Trả về mô tả cho Admin
    time_limit: int
    is_published: bool
    is_full_test_only: bool
    created_at: datetime
    parts: List[PartAdmin]
    class Config: from_attributes = True


# ==================== PUBLIC RESPONSE (Student) ====================
class QuestionPublic(QuestionBase):
    id: int
    group_id: int
    class Config: from_attributes = True

class QuestionGroupPublic(QuestionGroupBase):
    id: int
    questions: List[QuestionPublic]
    class Config: from_attributes = True

class PartPublic(PartBase):
    id: int
    groups: List[QuestionGroupPublic]
    class Config: from_attributes = True

class TestPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None # 🔥 ĐÃ THÊM: Trả về mô tả cho Student xem lúc bắt đầu thi
    time_limit: int
    parts: List[PartPublic]
    class Config: from_attributes = True

class TestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None # 🔥 ĐÃ THÊM: Trả về mô tả hiển thị ở màn hình Danh sách đề (Lobby)
    time_limit: int
    is_published: bool
    is_full_test_only: bool
    created_at: datetime
    status: Optional[str] = "NOT_STARTED"
    class Config: from_attributes = True


# ==================== SUBMISSION INPUT ====================
class StudentSubmissionRequest(BaseModel):
    test_id: int
    answers: Dict[str, str] = Field(default_factory=dict)
    is_full_test_only: bool = False


# ==================== SHARED SCHEMA ====================
class ReadingTestSummary(BaseModel):
    id: int
    title: str
    description: Optional[str] = None # 🔥 ĐÃ THÊM: (Tùy chọn) Để lịch sử thi hiển thị thêm mô tả nếu cần
    class Config: from_attributes = True


# ==================== SUBMISSION OUTPUT ====================
class SubmissionHistoryItem(BaseModel):
    id: int
    test_id: int
    test: Optional[ReadingTestSummary] = None
    status: str
    is_full_test_only: bool

    # 🔥 Đã đổi sang cơ chế điểm CEFR của Aptis
    correct_count: int
    score: int
    cefr_level: Optional[str] = None
    
    total_questions: int
    submitted_at: datetime
    class Config: from_attributes = True

class QuestionResultDetail(BaseModel):
    id: int
    question_number: int
    question_text: Optional[str] = None
    user_answer: Optional[str] = None
    correct_answer: str
    is_correct: bool
    explanation: Optional[str] = None

class SubmissionDetail(BaseModel):
    id: int
    test_id: int
    test: Optional[ReadingTestSummary] = None
    user_id: int
    status: str
    is_full_test_only: bool
    
    # 🔥 Đã đổi sang cơ chế điểm CEFR
    correct_count: int
    score: int
    cefr_level: Optional[str] = None
    total_questions: int
    
    submitted_at: datetime
    user_answers: Optional[Dict[str, str]] = None
    results: List[QuestionResultDetail]
    class Config: from_attributes = True


# ==================== ADMIN MANAGEMENT ====================
class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    class Config: from_attributes = True

class AdminReadingSubmissionResponse(SubmissionDetail):
    user: Optional[UserBasicInfo] = None

class ReadingScoreOverrideRequest(BaseModel):
    # 🔥 Cập nhật theo điểm Aptis
    score: int
    correct_count: Optional[int] = None
    cefr_level: Optional[str] = None