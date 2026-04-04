from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.modules.IELTS.writing.models import WritingSubmission, WritingTest, WritingStatus
from app.modules.IELTS.writing import schemas
from app.modules.subscriptions.service import SubscriptionService
from .utils import WritingUtils

class WritingSubmissionService:
    @staticmethod
    def create_submission(db: Session, user_id: int, sub_in: schemas.SubmitWriting):
        if not sub_in.is_full_test_only:
            SubscriptionService.check_and_increment_quota(db, user_id, "WRITING")

        sub = WritingSubmission(
            user_id=user_id,
            test_id=sub_in.test_id,
            task1_content=sub_in.task1_content,
            task2_content=sub_in.task2_content,
            task1_word_count=WritingUtils.count_words(sub_in.task1_content),
            task2_word_count=WritingUtils.count_words(sub_in.task2_content),
            status=WritingStatus.PENDING,
            is_full_test_only=sub_in.is_full_test_only,
            submitted_at=datetime.now()
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return sub

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(WritingSubmission).options(joinedload(WritingSubmission.test))\
                 .filter(WritingSubmission.user_id == user_id, WritingSubmission.is_full_test_only == False)\
                 .order_by(WritingSubmission.submitted_at.desc())\
                 .all()
    
    @staticmethod
    def get_submission_detail(db: Session, sub_id: int):
        return db.query(WritingSubmission)\
                 .options(
                     joinedload(WritingSubmission.test).joinedload(WritingTest.tasks)
                 )\
                 .filter(WritingSubmission.id == sub_id)\
                 .first()

    # --- ADMIN: SUBMISSION MANAGEMENT ---
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 10, status_filter: Optional[str] = None):
        query = db.query(WritingSubmission).options(
            joinedload(WritingSubmission.user),
            joinedload(WritingSubmission.test)
        ).filter(WritingSubmission.is_full_test_only == False)
        
        if status_filter:
            query = query.filter(WritingSubmission.status == status_filter)
            
        total = query.count()
        items = query.order_by(WritingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "items": [schemas.AdminWritingSubmissionResponse.model_validate(i) for i in items]
        }

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(WritingSubmission).options(
            joinedload(WritingSubmission.user),
            joinedload(WritingSubmission.test)
        ).filter(
            WritingSubmission.user_id == target_user_id
        ).order_by(WritingSubmission.submitted_at.desc()).all()