from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from fastapi import HTTPException
from datetime import datetime
from typing import Optional

from app.modules.APTIS.exam.models import AptisFullTest, AptisExamSubmission, AptisExamStatus, AptisExamStep
from .utils import AptisExamUtils

class AptisExamSubmissionService:
    @staticmethod
    def start_exam(db: Session, user_id: int, full_test_id: int):
        existing_sub = db.query(AptisExamSubmission).filter(
            AptisExamSubmission.user_id == user_id,
            AptisExamSubmission.full_test_id == full_test_id,
            AptisExamSubmission.status == AptisExamStatus.IN_PROGRESS.value,
        ).first()

        if existing_sub:
            return existing_sub


        new_sub = AptisExamSubmission(
            user_id=user_id,
            full_test_id=full_test_id,
            status=AptisExamStatus.IN_PROGRESS.value,
            current_step=AptisExamStep.GRAMMAR_VOCAB.value,
            start_time=datetime.now(),
        )

        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub

    @staticmethod
    def submit_skill_part(db: Session, user_id: int, exam_submission_id: int, current_step: str, skill_submission_id: int):
        sub = db.query(AptisExamSubmission).filter(
            AptisExamSubmission.id == exam_submission_id,
            AptisExamSubmission.user_id == user_id,
        ).first()

        if not sub:
            raise HTTPException(404, "Exam submission not found")

        if current_step == AptisExamStep.GRAMMAR_VOCAB.value:
            sub.grammar_vocab_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.LISTENING.value
            
        elif current_step == AptisExamStep.LISTENING.value:
            sub.listening_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.READING.value
            
        elif current_step == AptisExamStep.READING.value:
            sub.reading_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.WRITING.value
            
        elif current_step == AptisExamStep.WRITING.value:
            sub.writing_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.SPEAKING.value
            
        elif current_step == AptisExamStep.SPEAKING.value:
            sub.speaking_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.FINISHED.value
            
            sub.status = AptisExamStatus.PENDING.value
            sub.completed_at = datetime.now()

        db.commit()
        db.refresh(sub)
        
   
        if sub.status in [AptisExamStatus.COMPLETED.value, AptisExamStatus.PENDING.value]:
            AptisExamUtils.recalculate_overall_score(db, sub)

        return {
            "message": "Step transition successful",
            "next_step": sub.current_step,
            "exam_submission_id": sub.id
        }

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        sub = db.query(AptisExamSubmission).options(
            joinedload(AptisExamSubmission.user),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.grammar_vocab_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.listening_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.reading_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.writing_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.speaking_test),
            joinedload(AptisExamSubmission.grammar_vocab_submission),
            joinedload(AptisExamSubmission.listening_submission),
            joinedload(AptisExamSubmission.reading_submission),
            joinedload(AptisExamSubmission.writing_submission),
            joinedload(AptisExamSubmission.speaking_submission)
        ).filter(AptisExamSubmission.id == submission_id).first()

        if sub:
            AptisExamUtils.recalculate_overall_score(db, sub)
        return sub

    @staticmethod
    def get_my_history(db: Session, user_id: int):
        subs = db.query(AptisExamSubmission).options(
            joinedload(AptisExamSubmission.full_test),
            joinedload(AptisExamSubmission.grammar_vocab_submission),
            joinedload(AptisExamSubmission.listening_submission),
            joinedload(AptisExamSubmission.reading_submission),
            joinedload(AptisExamSubmission.writing_submission),
            joinedload(AptisExamSubmission.speaking_submission)
        ).filter(AptisExamSubmission.user_id == user_id).order_by(desc(AptisExamSubmission.start_time)).all()

        for s in subs:
            AptisExamUtils.recalculate_overall_score(db, s, auto_commit=False)
            
        db.commit() 
        return subs

    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(AptisExamSubmission).options(
            joinedload(AptisExamSubmission.user),
            joinedload(AptisExamSubmission.full_test),
            joinedload(AptisExamSubmission.grammar_vocab_submission),
            joinedload(AptisExamSubmission.listening_submission),
            joinedload(AptisExamSubmission.reading_submission),
            joinedload(AptisExamSubmission.writing_submission),
            joinedload(AptisExamSubmission.speaking_submission)
        )

        if status_filter:
            query = query.filter(AptisExamSubmission.status == status_filter)

        total = query.count()
        subs = query.order_by(AptisExamSubmission.start_time.desc()).offset(skip).limit(limit).all()

        for sub in subs:
            AptisExamUtils.recalculate_overall_score(db, sub, auto_commit=False)
            
        db.commit()
        return {"items": subs, "total": total}