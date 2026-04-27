from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

# --- ENUMS ---
class AptisExamStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED" 
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"

class AptisExamStep(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    GRAMMAR_VOCAB = "GRAMMAR_VOCAB" 
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
# 1. FULL TEST LIST 
# =======================================================
class AptisFullTestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
  
    user_status: str = "NOT_STARTED"  # NOT_STARTED, IN_PROGRESS, COMPLETED
    current_step: str = "NOT_STARTED" 
    exam_submission_id: Optional[int] = None 

    grammar_vocab_test: Optional[ComponentTestSummary] = None
    listening_test: Optional[ComponentTestSummary] = None
    reading_test: Optional[ComponentTestSummary] = None
    writing_test: Optional[ComponentTestSummary] = None
    speaking_test: Optional[ComponentTestSummary] = None
    class Config:
        from_attributes = True

# =======================================================
# 2. FULL TEST MANAGEMENT (ADMIN CRUD)
# =======================================================
class AptisFullTestBase(BaseModel):
    title: str
    description: Optional[str] = None


class AptisFullTestCreate(AptisFullTestBase):
    is_published: bool = False
    grammar_vocab_test_id: Optional[int] = None 
    listening_test_id: Optional[int] = None
    reading_test_id: Optional[int] = None
    writing_test_id: Optional[int] = None
    speaking_test_id: Optional[int] = None

class AptisFullTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    grammar_vocab_test_id: Optional[int] = None
    listening_test_id: Optional[int] = None
    reading_test_id: Optional[int] = None
    writing_test_id: Optional[int] = None
    speaking_test_id: Optional[int] = None

class AptisFullTestResponse(AptisFullTestBase):
    id: int
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    grammar_vocab_test_id: Optional[int] = None
    listening_test_id: Optional[int] = None
    reading_test_id: Optional[int] = None
    writing_test_id: Optional[int] = None
    speaking_test_id: Optional[int] = None

    grammar_vocab_test: Optional[ComponentTestSummary] = None 
    listening_test: Optional[ComponentTestSummary] = None
    reading_test: Optional[ComponentTestSummary] = None
    writing_test: Optional[ComponentTestSummary] = None
    speaking_test: Optional[ComponentTestSummary] = None

    class Config:
        from_attributes = True

# =======================================================
# 3. EXAM FLOW (USER ATTEMPT)
# =======================================================
class StartAptisExamRequest(BaseModel):
    full_test_id: int

class AptisExamSubmissionResponse(BaseModel):
    id: int
    user_id: int
    full_test_id: int

    status: str
    current_step: str

    start_time: datetime
    completed_at: Optional[datetime] = None


    grammar_vocab_submission_id: Optional[int] = None 
    listening_submission_id: Optional[int] = None
    reading_submission_id: Optional[int] = None
    writing_submission_id: Optional[int] = None
    speaking_submission_id: Optional[int] = None


    overall_score: Optional[int] = 0
    overall_cefr_level: Optional[str] = None 


    grammar_vocab_score: Optional[int] = None 
    listening_score: Optional[int] = None
    reading_score: Optional[int] = None
    writing_score: Optional[int] = None
    speaking_score: Optional[int] = None

    full_test: Optional[AptisFullTestResponse] = None

    class Config:
        from_attributes = True

class AptisStepTransitionResponse(BaseModel):
    message: str
    next_step: str
    exam_submission_id: int

class AptisSkillCompletionRequest(BaseModel):
    exam_submission_id: int
    current_step: str 
    skill_submission_id: int

# =======================================================
# 4. ADMIN MANAGEMENT & PAGING
# =======================================================
class AdminAptisExamSubmissionResponse(AptisExamSubmissionResponse):
    user: Optional[UserBasicInfo] = None
    
    class Config:
        from_attributes = True


class AdminAptisExamPagingResponse(BaseModel):
    items: List[AdminAptisExamSubmissionResponse]
    total: int

    class Config:
        from_attributes = True
