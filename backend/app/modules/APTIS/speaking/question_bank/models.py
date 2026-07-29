from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AptisSpeakingBankGroup(Base):
    __tablename__ = "aptis_speaking_bank_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    part_type = Column(String(50), nullable=False) # PART_1, PART_2, PART_3, PART_4
    
    instruction = Column(Text, nullable=True)        
    image_url = Column(String, nullable=True) 
    image_url_2 = Column(String, nullable=True) 
    
    difficulty_level = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)

    questions = relationship("AptisSpeakingBankQuestion", back_populates="group", cascade="all, delete-orphan", order_by="AptisSpeakingBankQuestion.order_number")


class AptisSpeakingBankQuestion(Base):
    __tablename__ = "aptis_speaking_bank_questions"

    id = Column(Integer, primary_key=True, index=True)
    bank_group_id = Column(Integer, ForeignKey("aptis_speaking_bank_groups.id"), index=True, nullable=False)
    
    order_number = Column(Integer, nullable=False) 
    question_text = Column(Text, nullable=True) 
    audio_url = Column(String, nullable=True)
    
    prep_time = Column(Integer, default=0)
    response_time = Column(Integer, default=0)
    
    group = relationship("AptisSpeakingBankGroup", back_populates="questions")
