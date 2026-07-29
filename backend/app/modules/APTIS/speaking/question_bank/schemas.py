from pydantic import BaseModel
from typing import List, Optional, Any, Dict

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

    class Config:
        from_attributes = True

class GenerateTestConfig(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: Optional[int] = 12
    is_published: Optional[bool] = False
    is_full_test_only: Optional[bool] = False
    part_difficulties: Optional[Dict[str, Optional[str]]] = None
