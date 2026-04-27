from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime
from typing import Optional

from app.modules.APTIS.speaking.models import (
    AptisSpeakingTest, AptisSpeakingPart, AptisSpeakingSubmission, 
    AptisSpeakingPartAnswer, AptisSpeakingStatus
)
from app.modules.APTIS.speaking import schemas

class AptisSpeakingSubmissionService:
    @staticmethod
    def save_part_submission(db: Session, user_id: int, req: schemas.SaveAptisSpeakingPartRequest):
        if not req.audio_url or not req.audio_url.strip():
            raise HTTPException(status_code=400, detail="Audio file URL cannot be empty.")

        submission = db.query(AptisSpeakingSubmission).filter(
            AptisSpeakingSubmission.user_id == user_id,
            AptisSpeakingSubmission.test_id == req.test_id,
            AptisSpeakingSubmission.status == AptisSpeakingStatus.IN_PROGRESS.value,
            AptisSpeakingSubmission.is_full_test_only == req.is_full_test_only
        ).first()

        if not submission:
            submission = AptisSpeakingSubmission(
                user_id=user_id,
                test_id=req.test_id,
                status=AptisSpeakingStatus.IN_PROGRESS.value,
                is_full_test_only = req.is_full_test_only,
            )
            db.add(submission)
            db.commit()
            db.refresh(submission)

        existing_answer = db.query(AptisSpeakingPartAnswer).filter(
            AptisSpeakingPartAnswer.submission_id == submission.id,
            AptisSpeakingPartAnswer.part_number == req.part_number
        ).first()

        if existing_answer:
            existing_answer.audio_url = req.audio_url
        else:
            new_answer = AptisSpeakingPartAnswer(
                submission_id=submission.id,
                part_number=req.part_number,
                audio_url=req.audio_url
            )
            db.add(new_answer)

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def finish_test(db: Session, submission_id: int, user_id: int):
        sub = db.query(AptisSpeakingSubmission).options(joinedload(AptisSpeakingSubmission.answers))\
            .filter(
                AptisSpeakingSubmission.id == submission_id,
                AptisSpeakingSubmission.user_id == user_id
            ).first()
        
        if not sub: raise HTTPException(404, "Submission not found")

        submitted_parts = {a.part_number for a in sub.answers}
        required_parts = {1, 2, 3, 4} 
        
        if not required_parts.issubset(submitted_parts):
            missing = required_parts - submitted_parts
            raise HTTPException(400, f"Vui lòng hoàn thành đủ 4 phần thi. (Thiếu: Part {missing})")

        sub.status = AptisSpeakingStatus.PENDING.value 
        sub.submitted_at = datetime.now()
        
        db.commit()
        db.refresh(sub)
        return sub

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.test)
        ).filter(AptisSpeakingSubmission.user_id == user_id,
                 AptisSpeakingSubmission.is_full_test_only == False).order_by(AptisSpeakingSubmission.submitted_at.desc()).all()

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        return db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.user),
            joinedload(AptisSpeakingSubmission.grader),
            joinedload(AptisSpeakingSubmission.answers),
            joinedload(AptisSpeakingSubmission.test).joinedload(AptisSpeakingTest.parts).joinedload(AptisSpeakingPart.questions)
        ).filter(AptisSpeakingSubmission.id == submission_id).first()
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, is_full_test_only: Optional[bool] = False, status_filter: Optional[str] = None):
        query = db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.user),
            joinedload(AptisSpeakingSubmission.test),
            joinedload(AptisSpeakingSubmission.grader)
        )
        
        if status_filter:
            query = query.filter(AptisSpeakingSubmission.status == status_filter)
        if is_full_test_only is not None:
            query = query.filter(AptisSpeakingSubmission.is_full_test_only == is_full_test_only)
            
        total = query.count()
        items = query.order_by(AptisSpeakingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        return {"items": items, "total": total}

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.user),
            joinedload(AptisSpeakingSubmission.test),
            joinedload(AptisSpeakingSubmission.grader)
        ).filter(AptisSpeakingSubmission.user_id == target_user_id).order_by(AptisSpeakingSubmission.submitted_at.desc()).all()

    @staticmethod
    def grade_submission(db: Session, submission_id: int, grader_id: int, req: schemas.SpeakingGradeRequest):
        sub = db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.answers)
        ).filter(AptisSpeakingSubmission.id == submission_id).first()
        
        if not sub: return None
            
        sub.total_score = req.total_score
        sub.cefr_level = req.cefr_level
        sub.overall_feedback = req.overall_feedback
        
        if req.part_feedbacks:
            for pf in req.part_feedbacks:
                answer = next((a for a in sub.answers if a.part_number == pf.part_number), None)
                if answer:
                    answer.part_score = pf.score
                    answer.admin_feedback = pf.comments
                
        sub.status = AptisSpeakingStatus.GRADED.value
        sub.graded_at = datetime.now()
        sub.graded_by = grader_id

        db.commit()
        return AptisSpeakingSubmissionService.get_submission_detail(db, submission_id)