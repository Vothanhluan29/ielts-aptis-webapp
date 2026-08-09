from pydantic import BaseModel
from typing import List, Optional, Any

# ==========================
# Bank Question Schemas
# ==========================
class BankQuestionBase(BaseModel):
    question_number: Optional[int] = None
    question_text: Optional[str] = None
    question_type: str
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

class BankQuestionCreate(BankQuestionBase):
    pass

class BankQuestionUpdate(BankQuestionBase):
    question_type: Optional[str] = None
    correct_answer: Optional[str] = None

class BankQuestionResponse(BankQuestionBase):
    id: int
    bank_group_id: int

    class Config:
        from_attributes = True

# ==========================
# Bank Group Schemas
# ==========================
class BankGroupBase(BaseModel):
    part_number: int
    instruction: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
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

    class Config:
        from_attributes = True

# ==========================
# Test Generation Config
# ==========================
class PartConfig(BaseModel):
    part_number: int
    num_questions: int
    difficulty: Optional[str] = None

class GenerateTestConfig(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 35
    is_full_test_only: bool = False
    difficulty_level: Optional[str] = None
    parts_config: List[PartConfig]


class PaginatedBankGroupResponse(BaseModel):
    items: List[BankGroupResponse]
    total: int
