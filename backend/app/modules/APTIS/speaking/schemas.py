from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Union, Dict
from datetime import datetime
import json

from .models import AptisSpeakingStatus

# ==================== 1. QUESTIONS ====================

class AptisSpeakingQuestionBase(BaseModel):
    order_number: int
    question_text: Optional[str] = ""
    audio_url: Optional[str] = ""
    prep_time: int = 0
    response_time: int = 0  

class AptisSpeakingQuestionCreate(AptisSpeakingQuestionBase):
    pass

class AptisSpeakingQuestionUpdate(AptisSpeakingQuestionBase):
    pass

class AptisSpeakingQuestionResponse(AptisSpeakingQuestionBase):
    id: int
    part_id: int
    
    class Config:
        from_attributes = True


# ==================== 2. PARTS ====================

class AptisSpeakingPartBase(BaseModel):
    part_number: int  
    part_type: str    
    instruction: Optional[str] = ""
    image_url: Optional[str] = ""
    image_url_2: Optional[str] = ""  

class AptisSpeakingPartCreate(AptisSpeakingPartBase):
    questions: List[AptisSpeakingQuestionCreate]

class AptisSpeakingPartUpdate(BaseModel):
    part_number: Optional[int] = None
    part_type: Optional[str] = None
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    image_url_2: Optional[str] = None
    questions: Optional[List[AptisSpeakingQuestionCreate]] = None

class AptisSpeakingPartResponse(AptisSpeakingPartBase):
    id: int
    test_id: int
    questions: List[AptisSpeakingQuestionResponse]
    
    class Config:
        from_attributes = True


# ==================== 3. TEST ====================

class AptisSpeakingTestBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int = 12  
    is_published: bool = False
    is_full_test_only: bool = False

class AptisSpeakingTestCreate(AptisSpeakingTestBase):
    parts: List[AptisSpeakingPartCreate]

class AptisSpeakingTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    is_published: Optional[bool] = None
    is_full_test_only: Optional[bool] = None
    parts: Optional[List[AptisSpeakingPartCreate]] = None 

class AptisSpeakingTestResponse(AptisSpeakingTestBase):
    id: int
    created_at: datetime
    parts: List[AptisSpeakingPartResponse]
    
    class Config:
        from_attributes = True

class AptisSpeakingTestListItem(BaseModel):
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


# ==================== 4. SUBMISSION INPUT ====================

class SaveAptisSpeakingPartRequest(BaseModel):
    test_id: int
    part_number: int
    question_index: int = 0  # Vị trí câu hỏi trong part (0-indexed)
    audio_url: str
    submission_id: Optional[int] = None
    is_full_test_only: bool = False


# ==================== 5. SUBMISSION OUTPUT ====================

class AptisSpeakingPartAnswerResponse(BaseModel):
    id: int
    part_number: int
    audio_url: str
    audio_urls: List[str] = []  # Danh sách URL đã parse từ JSON

    transcript: Optional[str] = None
    part_score: Optional[int] = None
    admin_feedback: Optional[str] = None

    @field_validator('audio_urls', mode='before')
    @classmethod
    def parse_audio_urls(cls, v, info):
        """Tự động parse audio_url JSON list hoặc URL đơn thành list."""
        # Nếu audio_urls đã được set thì dùng luôn
        if v:
            return v
        return []

    @field_validator('audio_url', mode='after')
    @classmethod
    def set_audio_urls_from_audio_url(cls, v):
        return v

    def model_post_init(self, __context: Any) -> None:
        """Sau khi khởi tạo, tự parse audio_url thành audio_urls."""
        if not self.audio_urls and self.audio_url:
            try:
                parsed = json.loads(self.audio_url)
                if isinstance(parsed, list):
                    self.audio_urls = [url for url in parsed if url]
                else:
                    self.audio_urls = [self.audio_url]
            except (json.JSONDecodeError, ValueError):
                # Không phải JSON → coi là URL đơn (backward compatible)
                self.audio_urls = [self.audio_url]

    class Config:
        from_attributes = True

class AptisSpeakingSubmissionResponse(BaseModel):
    id: int
    test_id: int
    user_id: int
    
    status: str 
    is_full_test_only: bool
    submitted_at: datetime
    graded_at: Optional[datetime] = None

    total_score: Optional[int] = None
    cefr_level: Optional[str] = None
    
    overall_feedback: Optional[str] = None
    
    answers: List[AptisSpeakingPartAnswerResponse] = []
    
    class Config:
        from_attributes = True


# ==================== 6. ADMIN MANAGEMENT SCHEMAS ====================

class UserBasicInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdminAptisSpeakingSubmissionDetailResponse(AptisSpeakingSubmissionResponse):
    user: Optional[UserBasicInfo] = None
    grader: Optional[UserBasicInfo] = None
    test: Optional[AptisSpeakingTestResponse] = None

    class Config:
        from_attributes = True


class AdminAptisSpeakingSubmissionListResponse(AptisSpeakingSubmissionResponse):
    user: Optional[UserBasicInfo] = None
    grader: Optional[UserBasicInfo] = None
    test: Optional[AptisSpeakingTestListItem] = None

    class Config:
        from_attributes = True

class AdminAptisSpeakingPagingResponse(BaseModel):
    items: List[AdminAptisSpeakingSubmissionListResponse]
    total: int

    class Config:
        from_attributes = True

# ==================== 7. MANUAL GRADING REQUEST ====================
class PartGradeRequest(BaseModel):
    part_number: int
    score: int
    comments: Optional[str] = ""

class SpeakingGradeRequest(BaseModel):
    total_score: int
    cefr_level: str
    overall_feedback: Optional[str] = None
    part_feedbacks: List[PartGradeRequest] 