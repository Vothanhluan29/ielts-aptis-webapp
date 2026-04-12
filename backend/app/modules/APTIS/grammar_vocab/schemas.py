from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from app.modules.APTIS.grammar_vocab.models import AptisQuestionPart, AptisGrammarVocabStatus

# =====================================================
# 1. QUESTION SCHEMAS
# =====================================================
class QuestionBase(BaseModel):
    question_number: int
    question_text: str
    options: Optional[Dict[str, str]] = None 

class QuestionCreate(QuestionBase):
    correct_answer: str
    explanation: Optional[str] = None

class QuestionUpdate(BaseModel):
    question_number: Optional[int] = None
    question_text: Optional[str] = None
    options: Optional[Dict[str, str]] = None 
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

# Dành cho Học viên (Đã giấu đáp án)
class QuestionForUser(QuestionBase):
    id: int
    group_id: int
    class Config: from_attributes = True

# Dành cho Admin (Hiển thị tất cả)
class QuestionAdminResponse(QuestionCreate):
    id: int
    group_id: int
    class Config: from_attributes = True

class GroupBase(BaseModel):
    part_type: AptisQuestionPart
    instruction: str

class GroupCreate(GroupBase):
    questions: List[QuestionCreate] = []

class GroupUpdate(BaseModel):
    part_type: Optional[AptisQuestionPart] = None
    instruction: Optional[str] = None
    questions: Optional[List[QuestionUpdate]] = None

class GroupForUser(GroupBase):
    id: int
    test_id : int
    questions: List[QuestionForUser] = []
    class Config: from_attributes = True


class GroupAdminResponse(GroupBase):
    id: int
    test_id : int
    questions: List[QuestionAdminResponse]
    class Config:
        from_attributes = True

# =====================================================
# 2. TEST SCHEMAS
# =====================================================
class TestBase(BaseModel):
    title: str
    description: Optional[str] = None # 
    time_limit: int = 25
    is_published: bool = False
    is_full_test_only: bool = False 

class TestCreate(TestBase):
    groups : Optional[List[GroupCreate]] = []

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None # 
    time_limit: Optional[int] = None
    is_published: Optional[bool] = None
    is_full_test_only: Optional[bool] = None
    groups : Optional[List[GroupUpdate]] = None

class TestResponse(TestBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

# Lớp rút gọn để trả về Danh sách (List) cho nhẹ server
class TestListItem(TestResponse):
    status: Optional[AptisGrammarVocabStatus] = AptisGrammarVocabStatus.NOT_STARTED 
    class Config: from_attributes = True

class TestTakeResponse(TestResponse):
    groups : List[GroupForUser]

class TestAdminDetailResponse(TestResponse):
    groups : List[GroupAdminResponse]

# =====================================================
# 3. SUBMISSION SCHEMAS
# =====================================================
class SubmissionCreate(BaseModel):
    test_id: int
    user_answers: Dict[str, Optional[str]]
    is_full_test_only: bool = False

class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    test_id: int
    is_full_test_only: bool = False
    grammar_score: int
    vocab_score: int
    total_score: int

    status: AptisGrammarVocabStatus

    user_answers: Dict[str, Optional[str]]
    answer_details: Optional[Dict[str, Any]] = None
    submitted_at: datetime
    class Config: from_attributes = True

# Dành cho trang Lịch sử làm bài (Gọn nhẹ)
class SubmissionHistoryItem(BaseModel):
    id: int
    test_id: int
    test: Optional[TestResponse] = None
    is_full_test_only: bool
    
    grammar_score: int
    vocab_score: int
    total_score: int
    
    status: AptisGrammarVocabStatus
    
    submitted_at: datetime
    class Config: from_attributes = True