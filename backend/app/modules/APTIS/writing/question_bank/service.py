from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import random
from fastapi import HTTPException
from app.modules.APTIS.writing.question_bank.models import AptisWritingBankGroup, AptisWritingBankQuestion
from app.modules.APTIS.writing.question_bank import schemas as bank_schemas
from app.modules.APTIS.writing import schemas
from app.modules.APTIS.writing.models import AptisWritingTest, AptisWritingPart, AptisWritingQuestion, AptisWritingPartType

class AptisWritingBankService:
    @staticmethod
    def get_bank_groups(
        db: Session, 
        part_number: int = None, 
        search: str = None, 
        difficulty_level: str = None, 
        skip: int = 0, 
        limit: int = 10
    ):
        query = db.query(AptisWritingBankGroup)
        
        if part_number is not None and hasattr(AptisWritingBankGroup, 'part_number'):
            query = query.filter(AptisWritingBankGroup.part_number == part_number)
            
        if search and hasattr(AptisWritingBankGroup, 'instruction'):
            query = query.filter(AptisWritingBankGroup.instruction.ilike(f"%{search}%"))
            
        if difficulty_level and hasattr(AptisWritingBankGroup, 'difficulty_level'):
            query = query.filter(AptisWritingBankGroup.difficulty_level == difficulty_level)
            
        total = query.count()
        items = query.order_by(AptisWritingBankGroup.id.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

    @staticmethod
    def get_bank_group(db: Session, group_id: int) -> AptisWritingBankGroup:
        group = db.query(AptisWritingBankGroup).filter(AptisWritingBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        return group

    @staticmethod
    def create_bank_group(db: Session, group_in: bank_schemas.BankGroupCreate) -> AptisWritingBankGroup:
        db_group = AptisWritingBankGroup(
            part_type=group_in.part_type,
            instruction=group_in.instruction,
            image_url=group_in.image_url,
            difficulty_level=group_in.difficulty_level,
            tags=group_in.tags
        )
        db.add(db_group)
        db.flush()

        for q_in in group_in.questions:
            db_q = AptisWritingBankQuestion(
                bank_group_id=db_group.id,
                order_number=q_in.order_number,
                question_text=q_in.question_text,
                sub_type=q_in.sub_type
            )
            db.add(db_q)
        
        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def update_bank_group(db: Session, group_id: int, group_in: bank_schemas.BankGroupUpdate) -> AptisWritingBankGroup:
        db_group = AptisWritingBankService.get_bank_group(db, group_id)
        
        db_group.part_type = group_in.part_type
        db_group.instruction = group_in.instruction
        db_group.image_url = group_in.image_url
        db_group.difficulty_level = group_in.difficulty_level
        db_group.tags = group_in.tags

        # Delete old questions
        db.query(AptisWritingBankQuestion).filter(AptisWritingBankQuestion.bank_group_id == group_id).delete()
        
        # Add new questions
        for q_in in group_in.questions:
            db_q = AptisWritingBankQuestion(
                bank_group_id=db_group.id,
                order_number=q_in.order_number,
                question_text=q_in.question_text,
                sub_type=q_in.sub_type
            )
            db.add(db_q)

        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def delete_bank_group(db: Session, group_id: int):
        db_group = AptisWritingBankService.get_bank_group(db, group_id)
        db.delete(db_group)
        db.commit()

    @staticmethod
    def generate_test(db: Session, config: bank_schemas.GenerateTestConfig):
        parts_to_pick = [
            AptisWritingPartType.PART_1,
            AptisWritingPartType.PART_2,
            AptisWritingPartType.PART_3,
            AptisWritingPartType.PART_4
        ]

        selected_groups = []

        for part_type in parts_to_pick:
            query = db.query(AptisWritingBankGroup).filter(AptisWritingBankGroup.part_type == part_type)
            
            part_diff = config.part_difficulties.get(part_type.value) if config.part_difficulties else None
            diff_to_use = part_diff or config.difficulty_level
            
            if diff_to_use:
                query = query.filter(AptisWritingBankGroup.difficulty_level == diff_to_use)
            
            groups = query.all()
            if not groups:
                raise HTTPException(status_code=400, detail=f"Not enough groups for {part_type.value.replace('_', ' ').title()} in the bank.")
            
            selected_groups.append(random.choice(groups))

        # Create Test
        db_test = AptisWritingTest(
            title=config.title,
            description=config.description,
            time_limit=config.time_limit,
            is_published=config.is_published,
            difficulty_level=config.difficulty_level,
            is_full_test_only=config.is_full_test_only
        )
        db.add(db_test)
        db.flush()

        # Add Parts and Questions
        for idx, bank_group in enumerate(selected_groups):
            db_part = AptisWritingPart(
                test_id=db_test.id,
                part_number=idx + 1,
                part_type=bank_group.part_type.value,
                instruction=bank_group.instruction,
                image_url=bank_group.image_url
            )
            db.add(db_part)
            db.flush()

            for bank_q in bank_group.questions:
                db_q = AptisWritingQuestion(
                    part_id=db_part.id,
                    question_text=bank_q.question_text,
                    order_number=bank_q.order_number,
                    sub_type=bank_q.sub_type
                )
                db.add(db_q)

        db.commit()
        db.refresh(db_test)
        return db_test
