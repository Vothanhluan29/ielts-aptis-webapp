from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import random
from fastapi import HTTPException, status
from app.modules.APTIS.listening.question_bank.models import AptisListeningBankGroup, AptisListeningBankQuestion
from app.modules.APTIS.listening.models import AptisListeningTest, AptisListeningPart, AptisListeningQuestionGroup, AptisListeningQuestion
from app.modules.APTIS.listening.question_bank import schemas as bank_schemas

class BankService:
    @staticmethod
    def create_bank_group(db: Session, group_in: bank_schemas.BankGroupCreate):
        new_group = AptisListeningBankGroup(
            part_number=group_in.part_number,
            instruction=group_in.instruction,
            image_url=group_in.image_url,
            audio_url=group_in.audio_url,
            transcript=group_in.transcript,
            difficulty_level=group_in.difficulty_level,
            tags=group_in.tags
        )
        db.add(new_group)
        db.flush()

        for q_in in group_in.questions:
            new_q = AptisListeningBankQuestion(
                bank_group_id=new_group.id,
                question_number=q_in.question_number,
                question_text=q_in.question_text,
                question_type=q_in.question_type,
                options=q_in.options,
                correct_answer=q_in.correct_answer,
                explanation=q_in.explanation,
                audio_url=q_in.audio_url
            )
            db.add(new_q)
        db.commit()
        db.refresh(new_group)
        return new_group

    @staticmethod
    def get_bank_groups(
        db: Session, 
        part_number: int = None, 
        search: str = None, 
        difficulty_level: str = None, 
        skip: int = 0, 
        limit: int = 10
    ):
        query = db.query(AptisListeningBankGroup)
        
        if part_number is not None and hasattr(AptisListeningBankGroup, 'part_number'):
            query = query.filter(AptisListeningBankGroup.part_number == part_number)
            
        if search and hasattr(AptisListeningBankGroup, 'instruction'):
            query = query.filter(AptisListeningBankGroup.instruction.ilike(f"%{search}%"))
            
        if difficulty_level and hasattr(AptisListeningBankGroup, 'difficulty_level'):
            query = query.filter(AptisListeningBankGroup.difficulty_level == difficulty_level)
            
        total = query.count()
        items = query.order_by(AptisListeningBankGroup.id.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

    @staticmethod
    def get_bank_group_by_id(db: Session, group_id: int):
        group = db.query(AptisListeningBankGroup).filter(AptisListeningBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        return group

    @staticmethod
    def update_bank_group(db: Session, group_id: int, group_in: bank_schemas.BankGroupUpdate):
        group = db.query(AptisListeningBankGroup).filter(AptisListeningBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")

        # Update group fields
        update_data = group_in.dict(exclude_unset=True, exclude={"questions"})
        for key, value in update_data.items():
            setattr(group, key, value)
        
        # Completely replace questions if provided
        if group_in.questions is not None:
            # Delete old questions
            db.query(AptisListeningBankQuestion).filter(AptisListeningBankQuestion.bank_group_id == group.id).delete()
            db.flush()

            # Insert new questions
            for q_in in group_in.questions:
                new_q = AptisListeningBankQuestion(
                    bank_group_id=group.id,
                    question_number=q_in.question_number,
                    question_text=q_in.question_text,
                    question_type=q_in.question_type,
                    options=q_in.options,
                    correct_answer=q_in.correct_answer,
                    explanation=q_in.explanation,
                    audio_url=q_in.audio_url
                )
                db.add(new_q)

        db.commit()
        db.refresh(group)
        return group

    @staticmethod
    def delete_bank_group(db: Session, group_id: int):
        group = db.query(AptisListeningBankGroup).filter(AptisListeningBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        db.delete(group)
        db.commit()
        return {"detail": "Deleted successfully"}

    @staticmethod
    def get_bank_stats(db: Session):
        stats = db.query(
            AptisListeningBankGroup.part_number,
            AptisListeningBankGroup.difficulty_level,
            func.count(AptisListeningBankGroup.id).label('count')
        ).group_by(
            AptisListeningBankGroup.part_number,
            AptisListeningBankGroup.difficulty_level
        ).all()
        
        return [
            {"part": row.part_number, "difficulty_level": row.difficulty_level, "count": row.count}
            for row in stats
        ]

    @staticmethod
    def generate_test(db: Session, config: bank_schemas.GenerateTestConfig):
        # 1. Create Test Record
        new_test = AptisListeningTest(
            title=config.title,
            description=config.description,
            time_limit=config.time_limit,
            is_full_test_only=config.is_full_test_only,
            is_published=True,
            difficulty_level=config.difficulty_level,
        )
        db.add(new_test)
        db.flush()

        # 2. Iterate Parts config and pull randomly from Bank
        for part_config in config.parts_config:
            new_part = AptisListeningPart(
                test_id=new_test.id,
                part_number=part_config.part_number,
                title=f"Part {part_config.part_number}"
            )
            db.add(new_part)
            db.flush()

            # Find exactly 1 random bank group for this part
            query = db.query(AptisListeningBankGroup)\
                .join(AptisListeningBankGroup.questions)\
                .filter(AptisListeningBankGroup.part_number == part_config.part_number)
            
            if part_config.difficulty:
                query = query.filter(AptisListeningBankGroup.difficulty_level == part_config.difficulty)

            query = query.group_by(AptisListeningBankGroup.id)\
                .having(func.count(AptisListeningBankQuestion.id) >= part_config.num_questions)

            random_bank_group = query.order_by(func.random()).first()

            if not random_bank_group:
                diff_msg = f" with difficulty {part_config.difficulty}" if part_config.difficulty else ""
                raise HTTPException(
                    status_code=400, 
                    detail=f"No bank groups found with at least {part_config.num_questions} questions for Part {part_config.part_number}{diff_msg}. Please add more questions to the bank or select a different configuration."
                )

            new_group = AptisListeningQuestionGroup(
                part_id=new_part.id,
                instruction=random_bank_group.instruction,
                image_url=random_bank_group.image_url,
                audio_url=random_bank_group.audio_url,
                transcript=random_bank_group.transcript,
                order=1
            )
            db.add(new_group)
            db.flush()

            # Shuffle and pick num_questions questions
            available_qs = random_bank_group.questions
            if len(available_qs) < part_config.num_questions:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough questions in bank group for Part {part_config.part_number}. Required: {part_config.num_questions}, Available: {len(available_qs)}. Please add more questions to this bank group."
                )
            selected_qs = random.sample(available_qs, part_config.num_questions)

            for bank_q in selected_qs:
                new_q = AptisListeningQuestion(
                    group_id=new_group.id,
                    question_number=bank_q.question_number,
                    question_text=bank_q.question_text,
                    question_type=bank_q.question_type,
                    options=bank_q.options,
                    correct_answer=bank_q.correct_answer,
                    explanation=bank_q.explanation,
                    audio_url=bank_q.audio_url
                )
                db.add(new_q)

        db.commit()
        db.refresh(new_test)
        return new_test
