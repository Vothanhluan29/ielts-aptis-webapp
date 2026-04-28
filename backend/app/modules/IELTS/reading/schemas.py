from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================
class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    MULTIPLE_ANSWER = "MULTIPLE_ANSWER"
    TRUE_FALSE_NOT_GIVEN = "TRUE_FALSE_NOT_GIVEN"
    YES_NO_NOT_GIVEN = "YES_NO_NOT_GIVEN"
    SENTENCE_COMPLETION = "SENTENCE_COMPLETION"
    SUMMARY_COMPLETION = "SUMMARY_COMPLETION"
    MATCHING_HEADINGS = "MATCHING_HEADINGS"
    MATCHING_FEATURES = "MATCHING_FEATURES"
    MATCHING_PARAGRAPH_INFORMATION = "MATCHING_PARAGRAPH_INFORMATION"

# ==================== BASE MODELS ====================
class QuestionBase(BaseModel):
    question_number: int
    question_text: str
    question_type: QuestionType
    options: Optional[Union[Dict[str, Any], List[str], str]] = None

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v):
        if v is None:
            return {}
        if isinstance(v, list):
            result = {}
            for item in v:
                if isinstance(item, str) and "." in item:
                    parts = item.split('.', 1)
                    if len(parts) == 2:
                        result[parts[0].strip()] = parts[1].strip()
            return result if result else v
        return v


class QuestionGroupBase(BaseModel):
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0


class PassageBase(BaseModel):
    title: Optional[str] = None
    content: str
    order: int


# ==================== ADMIN INPUT ====================
class QuestionCreateOrUpdate(QuestionBase):
    id: Optional[int] = None
    correct_answers: List[str] = [] 
    explanation: Optional[str] = None


class QuestionGroupCreateOrUpdate(QuestionGroupBase):
    id: Optional[int] = None
    questions: List[QuestionCreateOrUpdate] = []


class PassageCreateOrUpdate(PassageBase):
    id: Optional[int] = None
    groups: List[QuestionGroupCreateOrUpdate] = []


class TestCreateOrUpdate(BaseModel):
    title: str
    description: Optional[str] = None  
    time_limit: int = 60
    is_published: bool = False
    is_full_test_only: bool = False
    passages: List[PassageCreateOrUpdate] = []


# ==================== ADMIN RESPONSE ====================
class QuestionAdmin(QuestionCreateOrUpdate):
    id: int
    group_id: int

    class Config:
        from_attributes = True


class QuestionGroupAdmin(QuestionGroupBase):
    id: int
    passage_id: int
    questions: List[QuestionAdmin]

    class Config:
        from_attributes = True


class PassageAdmin(PassageBase):
    id: int
    groups: List[QuestionGroupAdmin]

    class Config:
        from_attributes = True


class TestAdmin(BaseModel):
    id: int
    title: str
    description: Optional[str] = None 
    time_limit: int
    is_published: bool
    is_full_test_only: bool
    created_at: datetime
    passages: List[PassageAdmin]

    class Config:
        from_attributes = True


# ==================== PUBLIC RESPONSE (Student) ====================
class QuestionPublic(BaseModel):
    id: int
    group_id: int
    question_number: int
    question_text: str
    question_type: QuestionType
    options: Optional[Union[Dict[str, Any], List[str], str]] = None

    class Config:
        from_attributes = True


class QuestionGroupPublic(QuestionGroupBase):
    id: int
    questions: List[QuestionPublic]

    class Config:
        from_attributes = True


class PassagePublic(PassageBase):
    id: int
    groups: List[QuestionGroupPublic]

    class Config:
        from_attributes = True


class TestPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None 
    time_limit: int
    passages: List[PassagePublic]

    class Config:
        from_attributes = True


class TestListItem(BaseModel):
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


# ==================== SUBMISSION INPUT ====================
class StudentSubmissionRequest(BaseModel):
    test_id: int
    user_answers: Dict[str, str] = Field(default_factory=dict)
    is_full_test_only: bool = False


# ==================== SHARED SCHEMA ====================
class ReadingTestSummary(BaseModel):
    id: int
    title: str
    description: Optional[str] = None  
    class Config:
        from_attributes = True


# ==================== SUBMISSION OUTPUT ====================
class SubmissionHistoryItem(BaseModel):
    id: int
    test_id: int
    test: Optional[ReadingTestSummary] = None
    status: str
    is_full_test_only: bool

    band_score: float
    correct_count: int
    total_questions: int
    submitted_at: datetime

    class Config:
        from_attributes = True


class QuestionResultDetail(BaseModel):
    id: int
    question_number: int
    question_text: str
    user_answer: Optional[str] = None
    correct_answers: List[str] 
    is_correct: bool
    explanation: Optional[str] = None


class SubmissionDetail(BaseModel):
    id: int
    test_id: int
    test: Optional[ReadingTestSummary] = None
    user_id: int
    status: str
    is_full_test_only: bool
    band_score: float
    correct_count: int
    total_questions: int
    submitted_at: datetime

    user_answers: Optional[Dict[str, str]] = None
    results: List[QuestionResultDetail]

    class Config:
        from_attributes = True


# ==================== ADMIN MANAGEMENT ====================
class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class AdminReadingSubmissionResponse(SubmissionDetail):
    user: Optional[UserBasicInfo] = None