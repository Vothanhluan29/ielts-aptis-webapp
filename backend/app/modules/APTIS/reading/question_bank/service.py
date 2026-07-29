from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import random
from fastapi import HTTPException, status
from app.modules.APTIS.reading.question_bank.models import AptisReadingBankGroup, AptisReadingBankQuestion
from app.modules.APTIS.reading.models import AptisReadingTest, AptisReadingPart, AptisReadingQuestionGroup, AptisReadingQuestion
from app.modules.APTIS.reading.question_bank import schemas as bank_schemas

class BankService:
    @staticmethod
    def create_bank_group(db: Session, group_in: bank_schemas.BankGroupCreate):
        new_group = AptisReadingBankGroup(
            part_number=group_in.part_number,
            instruction=group_in.instruction,
            content=group_in.content,
            image_url=group_in.image_url,
            difficulty_level=group_in.difficulty_level,
            tags=group_in.tags
        )
        db.add(new_group)
        db.flush()

        if group_in.questions:
            for q_in in group_in.questions:
                new_q = AptisReadingBankQuestion(
                    bank_group_id=new_group.id,
                    question_number=q_in.question_number,
                    question_text=q_in.question_text,
                    question_type=q_in.question_type,
                    options=q_in.options,
                    correct_answer=q_in.correct_answer,
                    explanation=q_in.explanation
                )
                db.add(new_q)
        
        db.commit()
        db.refresh(new_group)
        return new_group

    @staticmethod
    def get_bank_groups(db: Session, part_number: int = None):
        query = db.query(AptisReadingBankGroup)
        if part_number:
            query = query.filter(AptisReadingBankGroup.part_number == part_number)
        return query.order_by(AptisReadingBankGroup.id.desc()).all()

    @staticmethod
    def get_bank_group_by_id(db: Session, group_id: int):
        group = db.query(AptisReadingBankGroup).filter(AptisReadingBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        return group

    @staticmethod
    def update_bank_group(db: Session, group_id: int, group_in: bank_schemas.BankGroupUpdate):
        group = db.query(AptisReadingBankGroup).filter(AptisReadingBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")

        # Update group fields
        update_data = group_in.dict(exclude_unset=True, exclude={"questions"})
        for key, value in update_data.items():
            setattr(group, key, value)
        
        # Completely replace questions if provided
        if group_in.questions is not None:
            # Delete old questions
            db.query(AptisReadingBankQuestion).filter(AptisReadingBankQuestion.bank_group_id == group.id).delete()
            db.flush()

            # Insert new questions
            for q_in in group_in.questions:
                new_q = AptisReadingBankQuestion(
                    bank_group_id=group.id,
                    question_number=q_in.question_number,
                    question_text=q_in.question_text,
                    question_type=q_in.question_type,
                    options=q_in.options,
                    correct_answer=q_in.correct_answer,
                    explanation=q_in.explanation
                )
                db.add(new_q)

        db.commit()
        db.refresh(group)
        return group

    @staticmethod
    def delete_bank_group(db: Session, group_id: int):
        group = db.query(AptisReadingBankGroup).filter(AptisReadingBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        db.delete(group)
        db.commit()
        return {"detail": "Deleted successfully"}

    @staticmethod
    def generate_test(db: Session, config: bank_schemas.GenerateTestConfig):
        # 1. Create Test Record
        new_test = AptisReadingTest(
            title=config.title,
            description=config.description,
            time_limit=config.time_limit,
            is_full_test_only=config.is_full_test_only,
            is_published=True,
            difficulty_level=config.difficulty_level,
        )
        db.add(new_test)
        db.flush()

        import random

        # 2. Iterate over parts_config
        for part_config in config.parts_config:
            p_num = part_config.part_number
            num_q = part_config.num_questions

            new_part = AptisReadingPart(
                test_id=new_test.id,
                part_number=p_num,
                title=f"Part {p_num}"
            )
            db.add(new_part)
            db.flush()

            query = db.query(AptisReadingBankGroup)\
                .filter(AptisReadingBankGroup.part_number == p_num)

            if part_config.difficulty:
                query = query.filter(AptisReadingBankGroup.difficulty_level == part_config.difficulty)

            random_bank_group = query.order_by(func.random()).first()

            if not random_bank_group:
                diff_msg = f" with difficulty {part_config.difficulty}" if part_config.difficulty else ""
                raise HTTPException(
                    status_code=400, 
                    detail=f"No questions found in the bank for Part {p_num}{diff_msg}. Please add more questions to the bank or select a different configuration."
                )

            new_group = AptisReadingQuestionGroup(
                part_id=new_part.id,
                instruction=random_bank_group.instruction,
                image_url=random_bank_group.image_url,
                order=1
            )
            
            # Transfer long text content directly to the Part
            new_part.content = random_bank_group.content
            
            db.add(new_group)
            db.flush()

            available_qs = random_bank_group.questions
            
            # Shuffle and limit to num_questions for all parts
            selected_qs = random.sample(available_qs, min(len(available_qs), num_q))

            for idx, bank_q in enumerate(selected_qs):
                new_q = AptisReadingQuestion(
                    group_id=new_group.id,
                    question_number=idx + 1,
                    question_text=bank_q.question_text,
                    question_type=bank_q.question_type,
                    options=bank_q.options,
                    correct_answer=bank_q.correct_answer,
                    explanation=bank_q.explanation
                )
                db.add(new_q)

        db.commit()
        db.refresh(new_test)
        return new_test
