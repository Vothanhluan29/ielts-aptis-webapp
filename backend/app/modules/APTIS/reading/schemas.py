from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from enum import Enum

# = ENUMS  ==
class AptisReadingQuestionType(str, Enum):
    FILL_IN_BLANKS = "FILL_IN_BLANKS"           
    REORDER_SENTENCES = "REORDER_SENTENCES"     
    MATCHING_OPINIONS = "MATCHING_OPINIONS"    
    MATCHING_HEADINGS = "MATCHING_HEADINGS"       
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"           


# ==================== BASE MODELS ====================
class QuestionBase(BaseModel):
    question_number: int
    question_text: Optional[str] = None 
    question_type: AptisReadingQuestionType
    
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

class PartBase(BaseModel):
    part_number: int = 1
    title: Optional[str] = None
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
    description: Optional[str] = None 
    time_limit: int = 35 
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
    description: Optional[str] = None 
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
    description: Optional[str] = None 
    time_limit: int
    parts: List[PartPublic]
    class Config: from_attributes = True

class TestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None 
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
    description: Optional[str] = None 
    class Config: from_attributes = True


# ==================== SUBMISSION OUTPUT ====================
class SubmissionHistoryItem(BaseModel):
    id: int
    test_id: int
    test: Optional[ReadingTestSummary] = None
    status: str
    is_full_test_only: bool
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
    score: int
    correct_count: Optional[int] = None
    cefr_level: Optional[str] = None