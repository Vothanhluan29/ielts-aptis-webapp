from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.modules.APTIS.grammar_vocab.models import AptisQuestionPart

# ==========================
# Question Schemas
# ==========================
class BankQuestionBase(BaseModel):
    question_number: int
    question_text: str
    options: Optional[Any] = None
    correct_answer: str
    explanation: Optional[str] = None

class BankQuestionCreate(BankQuestionBase):
    pass

class BankQuestionUpdate(BankQuestionBase):
    pass

class BankQuestionResponse(BankQuestionBase):
    id: int
    bank_group_id: int

    class Config:
        from_attributes = True

# ==========================
# Group Schemas
# ==========================
class BankGroupBase(BaseModel):
    part_type: AptisQuestionPart
    instruction: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[Any] = None

class BankGroupCreate(BankGroupBase):
    questions: List[BankQuestionCreate] = []

class BankGroupUpdate(BankGroupBase):
    questions: List[BankQuestionCreate] = []

class BankGroupResponse(BankGroupBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    questions: List[BankQuestionResponse] = []

    class Config:
        from_attributes = True

# ==========================
# Generator Config
# ==========================
class GenerateTestConfig(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 25
    is_published: bool = False
    is_full_test_only: bool = False
    difficulty_level: Optional[str] = None
    part_difficulties: Optional[dict] = None
    tags: Optional[List[str]] = None


class PaginatedBankGroupResponse(BaseModel):
    items: List[BankGroupResponse]
    total: int

class BankGroupStatItem(BaseModel):
    part: Any
    difficulty_level: Optional[str]
    count: int
