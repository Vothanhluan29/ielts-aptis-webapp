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


class AIErrorItem(BaseModel):
    text: str          
    fix: str           
    type: str           
    explanation: Optional[str] = None

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

# ==================== 2. PARTS====================
class SpeakingPartBase(BaseModel):
    part_number: int
    instruction: Optional[str] = None
    cue_card: Optional[str] = None

class SpeakingPartCreate(SpeakingPartBase):
    questions: List[SpeakingQuestionCreate] 

class SpeakingPartUpdate(BaseModel):
    part_number: Optional[int] = None
    instruction: Optional[str] = None
    cue_card: Optional[str] = None
    questions: Optional[List[SpeakingQuestionCreate]] = None

class SpeakingPartResponse(SpeakingPartBase):
    id: int
    test_id: int
    questions: List[SpeakingQuestionResponse] = [] 
    class Config:
        from_attributes = True

# ==================== 3. TEST  ====================
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

# ==================== 4. SUBMISSION INPUT  ====================

class SaveSpeakingQuestionRequest(BaseModel):
    test_id: int
    question_id: int       
    audio_url: str         
    submission_id: Optional[int] = None 
    is_full_test_only: bool = False

# ==================== 5. SUBMISSION OUTPUT ====================


class SpeakingQuestionAnswerResponse(BaseModel):
    id: int
    question_id: int
    audio_url: str
    
  
    transcript: Optional[str] = None
    feedback: Optional[str] = None
    

    score_fluency: Optional[float] = None
    score_lexical: Optional[float] = None
    score_grammar: Optional[float] = None
    score_pronunciation: Optional[float] = None
    

    correction: Optional[List[AIErrorItem]] = None


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


class SpeakingSubmissionResponse(BaseModel):
    id: int
    test_id: int
    user_id: int
    
    status: str
    is_full_test_only: bool
    submitted_at: datetime
    graded_at: Optional[datetime] = None


    band_score: Optional[float] = None
    score_fluency: Optional[float] = None
    score_lexical: Optional[float] = None
    score_grammar: Optional[float] = None
    score_pronunciation: Optional[float] = None

    overall_feedback: Optional[str] = None

    answers: List[SpeakingQuestionAnswerResponse] = []
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

