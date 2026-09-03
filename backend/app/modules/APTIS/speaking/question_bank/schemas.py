from pydantic import BaseModel, field_validator
from typing import List, Optional, Any, Dict
from app.core.url_helpers import rewrite_static_url

class SpeakingBankQuestionCreate(BaseModel):
    order_number: int
    question_text: Optional[str] = None
    audio_url: Optional[str] = None
    prep_time: Optional[int] = 0
    response_time: Optional[int] = 0

class SpeakingBankQuestionResponse(BaseModel):
    id: int
    bank_group_id: int
    order_number: int
    question_text: Optional[str] = None
    audio_url: Optional[str] = None
    prep_time: Optional[int] = 0
    response_time: Optional[int] = 0

    @field_validator('audio_url', mode='after')
    @classmethod
    def fix_audio_url(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True

class SpeakingBankGroupCreate(BaseModel):
    part_type: str
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    image_url_2: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None
    questions: List[SpeakingBankQuestionCreate] = []

class SpeakingBankGroupUpdate(SpeakingBankGroupCreate):
    pass

class SpeakingBankGroupResponse(BaseModel):
    id: int
    part_type: str
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    image_url_2: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None
    questions: List[SpeakingBankQuestionResponse] = []

    @field_validator('image_url', 'image_url_2', mode='after')
    @classmethod
    def fix_image_urls(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True

class GenerateTestConfig(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: Optional[int] = 12
    is_published: Optional[bool] = False
    is_full_test_only: Optional[bool] = False
    difficulty_level: Optional[str] = None
    part_difficulties: Optional[Dict[str, Optional[str]]] = None


class PaginatedSpeakingBankGroupResponse(BaseModel):
    items: List[SpeakingBankGroupResponse]
    total: int

class BankGroupStatItem(BaseModel):
    part: Any
    difficulty_level: Optional[str]
    count: int
