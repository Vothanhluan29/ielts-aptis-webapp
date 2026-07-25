from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AptisListeningBankGroup(Base):
    __tablename__ = "aptis_listening_bank_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(Integer, nullable=False) # 1, 2, 3, 4
    
    instruction = Column(Text, nullable=True)        
    image_url = Column(String(255), nullable=True) 
    audio_url = Column(String(255), nullable=True) 
    transcript = Column(Text, nullable=True)
    
    difficulty_level = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)

    questions = relationship("AptisListeningBankQuestion", back_populates="group", cascade="all, delete-orphan", order_by="AptisListeningBankQuestion.question_number")


class AptisListeningBankQuestion(Base):
    __tablename__ = "aptis_listening_bank_questions"

    id = Column(Integer, primary_key=True, index=True)
    bank_group_id = Column(Integer, ForeignKey("aptis_listening_bank_groups.id", ondelete="CASCADE"), nullable=False)
    
    question_number = Column(Integer) 
    question_text = Column(Text, nullable=True) 
    question_type = Column(String(50), nullable=False)

    options = Column(JSON, nullable=True) 
    correct_answer = Column(String(255), nullable=False) 
    explanation = Column(Text, nullable=True)
    audio_url = Column(String(255), nullable=True)
    
    group = relationship("AptisListeningBankGroup", back_populates="questions")
