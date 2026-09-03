from pydantic import BaseModel, field_validator
from typing import List, Optional, Any
from app.core.url_helpers import rewrite_static_url

# ==========================
# Bank Question Schemas
# ==========================
class BankQuestionBase(BaseModel):
    question_number: Optional[int] = None
    question_text: Optional[str] = None
    question_type: str
    options: Optional[Any] = None
    correct_answer: str
    explanation: Optional[str] = None
    audio_url: Optional[str] = None

class BankQuestionCreate(BankQuestionBase):
    pass

class BankQuestionUpdate(BankQuestionBase):
    question_type: Optional[str] = None
    correct_answer: Optional[str] = None

class BankQuestionResponse(BankQuestionBase):
    id: int
    bank_group_id: int

    @field_validator('audio_url', mode='after')
    @classmethod
    def fix_audio_url(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True

# ==========================
# Bank Group Schemas
# ==========================
class BankGroupBase(BaseModel):
    part_number: int
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[Any] = None

class BankGroupCreate(BankGroupBase):
    questions: Optional[List[BankQuestionCreate]] = []

class BankGroupUpdate(BankGroupBase):
    part_number: Optional[int] = None
    questions: Optional[List[BankQuestionCreate]] = None

class BankGroupResponse(BankGroupBase):
    id: int
    questions: List[BankQuestionResponse] = []

    @field_validator('image_url', 'audio_url', mode='after')
    @classmethod
    def fix_urls(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True

# ==========================
# Test Generation Config
# ==========================
class PartConfig(BaseModel):
    part_number: int
    num_questions: int
    difficulty: Optional[str] = None # number of questions to pick randomly for this part

class GenerateTestConfig(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 40
    is_full_test_only: bool = False
    difficulty_level: Optional[str] = None
    parts_config: List[PartConfig]


class PaginatedBankGroupResponse(BaseModel):
    items: List[BankGroupResponse]
    total: int

class BankGroupStatItem(BaseModel):
    part: int
    difficulty_level: Optional[str]
    count: int
