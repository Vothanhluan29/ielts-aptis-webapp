from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from sqlalchemy.types import JSON # Dùng JSON chung để tương thích cả MySQL/Postgres/SQLite
import enum
from app.core.database import Base

# Enum trạng thái
class ListeningStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GRADED = "GRADED"

class ListeningQuestionType(str, enum.Enum):
   
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"         
    MULTIPLE_ANSWER = "MULTIPLE_ANSWER"          
    
    
    MATCHING = "MATCHING"                        
    MAP_PLAN_LABELING = "MAP_PLAN_LABELING"      
    DIAGRAM_LABELING = "DIAGRAM_LABELING"      
    
    FORM_COMPLETION = "FORM_COMPLETION"          
    NOTE_COMPLETION = "NOTE_COMPLETION"         
    TABLE_COMPLETION = "TABLE_COMPLETION"       
    FLOWCHART_COMPLETION = "FLOWCHART_COMPLETION"
    SUMMARY_COMPLETION = "SUMMARY_COMPLETION"   
    SENTENCE_COMPLETION = "SENTENCE_COMPLETION" 
    SHORT_ANSWER = "SHORT_ANSWER"               

# 1. TEST 
class ListeningTest(Base):
    __tablename__ = "listening_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True) 
    
    time_limit = Column(Integer, default=40)  
    is_published = Column(Boolean, default=False)  
    is_full_test_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 


    parts = relationship("ListeningPart", back_populates="test", cascade="all, delete-orphan", order_by="ListeningPart.part_number")
    submissions = relationship("ListeningSubmission", back_populates="test", cascade="all, delete-orphan")

# 2. PART
class ListeningPart(Base):
    __tablename__ = "listening_parts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("listening_tests.id"), nullable=False)
    
    part_number = Column(Integer)   
    audio_url = Column(String, nullable=False) 
    transcript = Column(Text, nullable=True)  
    
    test = relationship("ListeningTest", back_populates="parts")
    groups = relationship("ListeningQuestionGroup", back_populates="part", cascade="all, delete-orphan", order_by="ListeningQuestionGroup.order")

# 3. GROUP
class ListeningQuestionGroup(Base):
    __tablename__ = "listening_question_groups"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("listening_parts.id"), nullable=False)
    
    instruction = Column(Text)        
    image_url = Column(String, nullable=True)
    order = Column(Integer, default=1)

    part = relationship("ListeningPart", back_populates="groups")
    questions = relationship("ListeningQuestion", back_populates="group", cascade="all, delete-orphan", order_by="ListeningQuestion.question_number")

# 4. QUESTION
class ListeningQuestion(Base):
    __tablename__ = "listening_questions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("listening_question_groups.id"), nullable=False)
    
    question_number = Column(Integer) 
    question_text = Column(Text, nullable=True) 
    question_type = Column(String, nullable=False) 
    
    options = Column(JSON, nullable=True) 
    

    correct_answers = Column(JSON, nullable=False) 
    
    explanation = Column(Text, nullable=True)

    group = relationship("ListeningQuestionGroup", back_populates="questions")

# 5. SUBMISSION 
class ListeningSubmission(Base):
    __tablename__ = "listening_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("listening_tests.id"), nullable=False)
    
    user_answers = Column(JSON, nullable=False) 
    band_score = Column(Float, default=0.0)
    correct_count = Column(Integer, default=0)
    
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default=ListeningStatus.IN_PROGRESS.value)
    is_full_test_only = Column(Boolean, default=False)

    test = relationship("ListeningTest", back_populates="submissions")
    user = relationship("User", backref=backref("listening_submissions", cascade="all, delete-orphan"))