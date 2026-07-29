from sqlalchemy.orm import Session
from typing import List
import random
from fastapi import HTTPException
from app.modules.APTIS.speaking.question_bank.models import AptisSpeakingBankGroup, AptisSpeakingBankQuestion
from app.modules.APTIS.speaking.question_bank import schemas as bank_schemas
from app.modules.APTIS.speaking.models import AptisSpeakingTest, AptisSpeakingPart, AptisSpeakingQuestion

class AptisSpeakingBankService:
    @staticmethod
    def get_all_bank_groups(db: Session) -> List[AptisSpeakingBankGroup]:
        return db.query(AptisSpeakingBankGroup).order_by(AptisSpeakingBankGroup.id.desc()).all()

    @staticmethod
    def get_bank_group(db: Session, group_id: int) -> AptisSpeakingBankGroup:
        group = db.query(AptisSpeakingBankGroup).filter(AptisSpeakingBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        return group

    @staticmethod
    def create_bank_group(db: Session, group_in: bank_schemas.SpeakingBankGroupCreate) -> AptisSpeakingBankGroup:
        db_group = AptisSpeakingBankGroup(
            part_type=group_in.part_type,
            instruction=group_in.instruction,
            image_url=group_in.image_url,
            image_url_2=group_in.image_url_2,
            difficulty_level=group_in.difficulty_level,
            tags=group_in.tags
        )
        db.add(db_group)
        db.flush()

        for q_in in group_in.questions:
            db_q = AptisSpeakingBankQuestion(
                bank_group_id=db_group.id,
                order_number=q_in.order_number,
                question_text=q_in.question_text,
                audio_url=q_in.audio_url,
                prep_time=q_in.prep_time,
                response_time=q_in.response_time
            )
            db.add(db_q)
        
        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def update_bank_group(db: Session, group_id: int, group_in: bank_schemas.SpeakingBankGroupUpdate) -> AptisSpeakingBankGroup:
        db_group = AptisSpeakingBankService.get_bank_group(db, group_id)
        
        db_group.part_type = group_in.part_type
        db_group.instruction = group_in.instruction
        db_group.image_url = group_in.image_url
        db_group.image_url_2 = group_in.image_url_2
        db_group.difficulty_level = group_in.difficulty_level
        db_group.tags = group_in.tags

        # Delete old questions
        db.query(AptisSpeakingBankQuestion).filter(AptisSpeakingBankQuestion.bank_group_id == group_id).delete()
        
        # Add new questions
        for q_in in group_in.questions:
            db_q = AptisSpeakingBankQuestion(
                bank_group_id=db_group.id,
                order_number=q_in.order_number,
                question_text=q_in.question_text,
                audio_url=q_in.audio_url,
                prep_time=q_in.prep_time,
                response_time=q_in.response_time
            )
            db.add(db_q)

        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def delete_bank_group(db: Session, group_id: int):
        db_group = AptisSpeakingBankService.get_bank_group(db, group_id)
        db.delete(db_group)
        db.commit()

    @staticmethod
    def generate_test(db: Session, config: bank_schemas.GenerateTestConfig):
        parts_to_pick = [
            "PART_1",
            "PART_2",
            "PART_3",
            "PART_4"
        ]

        selected_groups = []

        for part_type in parts_to_pick:
            query = db.query(AptisSpeakingBankGroup).filter(AptisSpeakingBankGroup.part_type == part_type)
            
            part_diff = config.part_difficulties.get(part_type) if config.part_difficulties else None
            if part_diff:
                query = query.filter(AptisSpeakingBankGroup.difficulty_level == part_diff)
            
            groups = query.all()
            
            if not groups:
                # Fallback without difficulty
                query_fallback = db.query(AptisSpeakingBankGroup).filter(AptisSpeakingBankGroup.part_type == part_type)
                groups = query_fallback.all()
                if not groups:
                    raise HTTPException(status_code=400, detail=f"No Bank Groups found for {part_type}")
            
            selected_group = random.choice(groups)
            selected_groups.append(selected_group)

        new_test = AptisSpeakingTest(
            title=config.title,
            description=config.description,
            time_limit=config.time_limit,
            is_published=config.is_published,
            is_full_test_only=config.is_full_test_only
        )
        db.add(new_test)
        db.flush()

        part_mapping = {
            "PART_1": 1,
            "PART_2": 2,
            "PART_3": 3,
            "PART_4": 4
        }

        for group in selected_groups:
            new_part = AptisSpeakingPart(
                test_id=new_test.id,
                part_number=part_mapping[group.part_type],
                part_type=group.part_type,
                instruction=group.instruction,
                image_url=group.image_url,
                image_url_2=group.image_url_2
            )
            db.add(new_part)
            db.flush()

            for bank_q in group.questions:
                new_q = AptisSpeakingQuestion(
                    part_id=new_part.id,
                    order_number=bank_q.order_number,
                    question_text=bank_q.question_text,
                    audio_url=bank_q.audio_url,
                    prep_time=bank_q.prep_time,
                    response_time=bank_q.response_time
                )
                db.add(new_q)

        db.commit()
        db.refresh(new_test)
        return new_test
