from pydantic import BaseModel, field_validator, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import json

class AptisListeningQuestionType(str, Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"   
    MATCHING = "MATCHING"                  
    SHORT_ANSWER = "SHORT_ANSWER"          

# =======================================================
# 1. BASE SCHEMAS
# =======================================================

# --- QUESTION ---
class QuestionBase(BaseModel):
    question_number: int
    question_text: Optional[str] = None
    question_type: AptisListeningQuestionType  
    options: Optional[Union[Dict[str, str], List[str], str]] = None 
    audio_url: Optional[str] = None

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

# --- GROUP ---
class GroupBase(BaseModel):
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None 
    transcript: Optional[str] = None 
    order: int = 1

# --- PART  ---
class PartBase(BaseModel):
    part_number: int
    title: Optional[str] = None  
# --- TEST ---
class TestBase(BaseModel):
    title: str
    description: Optional[str] = None 
    time_limit: int = 40
    is_published: bool = False 
    is_full_test_only: bool = False

# =======================================================
# 2. INPUT SCHEMAS (Create/Update)
# =======================================================

# Question
class QuestionCreate(QuestionBase):
    correct_answer: str
    explanation: Optional[str] = None

# Group 
class GroupCreate(GroupBase):
    questions: List[QuestionCreate] = []

# Part 
class PartCreate(PartBase):
    groups: List[GroupCreate] = []

# Test 
class ListeningTestCreate(TestBase):
    parts: List[PartCreate] = []


class QuestionUpdate(BaseModel):
    id: Optional[int] = None 
    question_number: Optional[int] = None
    question_text: Optional[str] = None
    question_type: Optional[AptisListeningQuestionType] = None
    options: Optional[Union[Dict[str, str], List[str], str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    audio_url: Optional[str] = None

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v):
        return QuestionBase.parse_options(v)

class GroupUpdate(BaseModel):
    id: Optional[int] = None
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None   
    transcript: Optional[str] = None 
    order: Optional[int] = None
    questions: Optional[List[QuestionUpdate]] = None

class PartUpdate(BaseModel):
    id: Optional[int] = None 
    title: Optional[str] = None
    part_number: Optional[int] = None
    groups: Optional[List[GroupUpdate]] = None

class ListeningTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    is_published: Optional[bool] = None
    is_full_test_only: Optional[bool] = None
    parts: Optional[List[PartUpdate]] = None


# =======================================================
# 3. OUTPUT SCHEMAS - STUDENT 
# =======================================================

class QuestionStudent(QuestionBase):
    id: int
    class Config: from_attributes = True

class GroupStudent(BaseModel): 
    id: int
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None 
    order: int
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
    user_answers: Dict[str, str] = Field(default_factory=dict)
    is_full_test_only: bool = False

class ResultDetailItem(BaseModel):
    id: int                  
    question_number: int
    question_text: Optional[str]
    user_answer: Optional[str] = ""
    correct_answer: str       
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
    
  
    correct_count: int
    score: int
    cefr_level: Optional[str] = None
    
    submitted_at: datetime
    class Config: from_attributes = True

class SubmissionDetail(BaseModel):
    id: int
    test_id: int
    user_id: int
    

    correct_count: int
    score: int
    cefr_level: Optional[str] = None
    total_questions: int 
    
    submitted_at: datetime
    test: Optional[TestTitleOnly] = None 
    user_answers: Optional[Dict[str, str]] = None 
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
    questions: List[QuestionResponseFull]
    class Config: from_attributes = True

class PartResponse(PartBase):
    id: int
    test_id: int
    groups: List[GroupResponse] 
    class Config: from_attributes = True

class ListeningTestResponse(TestBase):
    id: int
    parts: List[PartResponse]
    class Config: from_attributes = True


# =======================================================
# 6. ADMIN MANAGEMENT SCHEMAS (NEW)
# =======================================================

class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    class Config: from_attributes = True

class AdminListeningSubmissionResponse(SubmissionDetail):
    user: Optional[UserBasicInfo] = None

class ListeningScoreOverrideRequest(BaseModel):
  
    score: int
    correct_count: Optional[int] = None
    cefr_level: Optional[str] = None