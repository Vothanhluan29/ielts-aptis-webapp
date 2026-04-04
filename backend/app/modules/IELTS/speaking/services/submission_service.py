from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime
from typing import Optional

from app.modules.IELTS.speaking.models import SpeakingTest, SpeakingPart, SpeakingQuestion, SpeakingSubmission, SpeakingQuestionAnswer, SpeakingStatus
from app.modules.IELTS.speaking import schemas
from app.modules.subscriptions.service import SubscriptionService

class SpeakingSubmissionService:
    @staticmethod
    def save_question_submission(db: Session, user_id: int, req: schemas.SaveSpeakingQuestionRequest):
        if not req.audio_url or not req.audio_url.strip():
            raise HTTPException(status_code=400, detail="Audio file URL cannot be empty. Please record and upload your answer.")

        submission = db.query(SpeakingSubmission).filter(
            SpeakingSubmission.user_id == user_id,
            SpeakingSubmission.test_id == req.test_id,
            SpeakingSubmission.status == SpeakingStatus.IN_PROGRESS.value,
            SpeakingSubmission.is_full_test_only == req.is_full_test_only
        ).first()

        if not submission:
            submission = SpeakingSubmission(
                user_id=user_id,
                test_id=req.test_id,
                status=SpeakingStatus.IN_PROGRESS.value,
                is_full_test_only=req.is_full_test_only,
                submitted_at=datetime.now()
            )
            db.add(submission)
            db.commit()
            db.refresh(submission)

        existing_answer = db.query(SpeakingQuestionAnswer).filter(
            SpeakingQuestionAnswer.submission_id == submission.id,
            SpeakingQuestionAnswer.question_id == req.question_id
        ).first()

        if existing_answer:
            existing_answer.audio_url = req.audio_url
        else:
            new_answer = SpeakingQuestionAnswer(
                submission_id=submission.id,
                question_id=req.question_id,
                audio_url=req.audio_url
            )
            db.add(new_answer)

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def finish_test(db: Session, submission_id: int, user_id: int):
        sub = db.query(SpeakingSubmission).options(joinedload(SpeakingSubmission.answers))\
            .filter(
                SpeakingSubmission.id == submission_id,
                SpeakingSubmission.user_id == user_id
            ).first()
        
        if not sub:
            raise HTTPException(404, "Submission not found")

        total_questions = db.query(SpeakingQuestion).join(SpeakingPart).filter(SpeakingPart.test_id == sub.test_id).count()
        answered_questions = len(sub.answers)
        
        if answered_questions < total_questions:
            raise HTTPException(
                400,
                f"Please complete all {total_questions} questions before submitting the test. (You have answered {answered_questions} questions)"
            )

        if not sub.is_full_test_only:
            try:
                SubscriptionService.check_and_increment_quota(db, user_id, "SPEAKING")
            except Exception as e:
                raise HTTPException(400, str(e))

        sub.status = SpeakingStatus.SUBMITTED.value
        sub.submitted_at = datetime.now()
        
        db.commit()
        db.refresh(sub)
        return sub

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.test)
        ).filter(
            SpeakingSubmission.user_id == user_id,
            SpeakingSubmission.is_full_test_only == False
        ).order_by(SpeakingSubmission.submitted_at.desc()).all()

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        return db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.answers).joinedload(SpeakingQuestionAnswer.question),
            joinedload(SpeakingSubmission.test).joinedload(SpeakingTest.parts).joinedload(SpeakingPart.questions)
        ).filter(SpeakingSubmission.id == submission_id).first()
    
    @staticmethod
    def get_all_submissions_for_admin(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status_filter: Optional[SpeakingStatus] = None
    ):
        query = db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.user),
            joinedload(SpeakingSubmission.test)
        )
        
        if status_filter:
            val = status_filter.value if hasattr(status_filter, 'value') else status_filter
            query = query.filter(SpeakingSubmission.status == val)
            
        return query.order_by(SpeakingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.user),
            joinedload(SpeakingSubmission.test)
        ).filter(
            SpeakingSubmission.user_id == target_user_id
        ).order_by(SpeakingSubmission.submitted_at.desc()).all()