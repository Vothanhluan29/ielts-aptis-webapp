from pydantic import BaseModel, field_validator, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import json

class ListeningQuestionType(str, Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    MULTIPLE_ANSWER = "MULTIPLE_ANSWER"
    MATCHING = "MATCHING"
    MAP_PLAN_LABELING = "MAP_PLAN_LABELING"
    DIAGRAM_LABELING = "DIAGRAM_LABELING"
    FORM_COMPLETION = "FORM_COMPLETION"
    NOTE_COMPLETION = "NOTE_COMPLETION"
    TABLE_COMPLETION = "TABLE_COMPLETION"
    FLOWCHART_COMPLETION = "FLOWCHART_COMPLETION"
    SUMMARY_COMPLETION = "SUMMARY_COMPLETION"
    SENTENCE_COMPLETION = "SENTENCE_COMPLETION"
    SHORT_ANSWER = "SHORT_ANSWER"

# =======================================================
# 1. BASE SCHEMAS
# =======================================================

class QuestionBase(BaseModel):
    question_number: int
    question_text: Optional[str] = None
    question_type: ListeningQuestionType  
    options: Optional[Union[Dict[str, str], List[str], str]] = None 

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v):
        if v is None: return {}
        if isinstance(v, list):
            result = {}
            for item in v:
                if isinstance(item, str) and "." in item:
                    parts = item.split('.', 1)
                    if len(parts) == 2:
                        result[parts[0].strip()] = parts[1].strip()
            return result if result else v
        return v

class GroupBase(BaseModel):
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 1

class PartBase(BaseModel):
    part_number: int
    audio_url: str
    transcript: Optional[str] = None

class TestBase(BaseModel):
    title: str
    description: Optional[str] = None 
    time_limit: int = 40
    is_published: bool = False 
    is_full_test_only: bool = False

# =======================================================
# 2. INPUT SCHEMAS (Create/Update - ADMIN)
# =======================================================

class QuestionCreate(QuestionBase):
    id: Optional[int] = None 
    correct_answers: List[str] = []
    explanation: Optional[str] = None

class GroupCreate(GroupBase):
    id: Optional[int] = None
    questions: List[QuestionCreate] = []

class PartCreate(PartBase):
    id: Optional[int] = None
    groups: List[GroupCreate] = []

class ListeningTestCreateOrUpdate(TestBase):
    parts: List[PartCreate] = []

# =======================================================
# 3. OUTPUT SCHEMAS - STUDENT (Public)
# =======================================================

class QuestionStudent(QuestionBase):
    id: int
    class Config: from_attributes = True

class GroupStudent(GroupBase):
    id: int
    questions: List[QuestionStudent]
    class Config: from_attributes = True

class PartStudent(PartBase):
    id: int
    groups: List[GroupStudent]
    class Config: from_attributes = True

class ListeningTestStudent(TestBase):
    id: int
    parts: List[PartStudent]
    class Config: from_attributes = True

class ListeningTestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    time_limit: int
    is_published: bool
    is_full_test_only: bool
    created_at: datetime
    status: Optional[str] = "NOT_STARTED"
    class Config: from_attributes = True

# =======================================================
# 4. SUBMISSION & SCORING 
# =======================================================

class SubmitAnswer(BaseModel):
    test_id: int
    user_answers: Dict[str, Union[str, List[str]]] = Field(default_factory=dict)
    is_full_test_only: bool = False

class ResultDetailItem(BaseModel):
    id: int                  
    question_number: int
    question_text: Optional[str]
    user_answer: Optional[Union[str, List[str]]] = "" 
    correct_answers: List[str] 
    is_correct: bool
    explanation: Optional[str] = None

class TestTitleOnly(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    class Config: from_attributes = True

class SubmissionSummary(BaseModel):
    id: int
    test_id: int
    test: Optional[TestTitleOnly] = None 
    is_full_test_only: bool
    status: str
    band_score: float
    correct_count: int
    submitted_at: datetime
    class Config: from_attributes = True

class SubmissionDetail(BaseModel):
    id: int
    test_id: int
    user_id: int
    status: Optional[str] = None
    is_full_test_only: bool
    band_score: float
    correct_count: int
    total_questions: int 
    submitted_at: datetime
    test: Optional[TestTitleOnly] = None 
    user_answers: Optional[Dict[str, Union[str, List[str]]]] = None 
    results: List[ResultDetailItem]
    class Config: from_attributes = True

# =======================================================
# 5. ADMIN SCHEMAS (Full Data)
# =======================================================

class QuestionResponseFull(QuestionCreate):
    id: int
    group_id: int 
    class Config: from_attributes = True

class GroupResponse(GroupCreate):
    id: int
    part_id: int
    questions: List[QuestionResponseFull]
    class Config: from_attributes = True

class PartResponse(PartBase):
    id: int
    test_id: int
    groups: List[GroupResponse] 
    class Config: from_attributes = True

class ListeningTestResponse(TestBase):
    id: int
    created_at: datetime
    parts: List[PartResponse]
    class Config: from_attributes = True

# =======================================================
# 6. ADMIN MANAGEMENT SCHEMAS
# =======================================================

class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    class Config: from_attributes = True

class AdminListeningSubmissionResponse(SubmissionDetail):
    user: Optional[UserBasicInfo] = None
