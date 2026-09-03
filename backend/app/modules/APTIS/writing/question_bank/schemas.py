from pydantic import BaseModel, field_validator
from typing import List, Optional, Any
from datetime import datetime
from app.core.url_helpers import rewrite_static_url
from app.modules.APTIS.writing.models import AptisWritingPartType

# ==========================
# Question Schemas
# ==========================
class BankQuestionBase(BaseModel):
    order_number: int = 1
    question_text: str
    sub_type: Optional[str] = None

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
    part_type: AptisWritingPartType
    instruction: Optional[str] = None
    image_url: Optional[str] = None
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

    @field_validator('image_url', mode='after')
    @classmethod
    def fix_image_url(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True

# ==========================
# Generator Config
# ==========================
class GenerateTestConfig(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 50
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
