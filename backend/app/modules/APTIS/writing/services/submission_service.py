import json
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.modules.APTIS.writing.models import (
    AptisWritingTest, AptisWritingPart, 
    AptisWritingSubmission, AptisWritingStatus
)
from app.modules.APTIS.writing import schemas
from app.modules.notifications import models as notif_models
from app.core.websockets import manager
from app.core.teacher_scope import apply_teacher_submission_scope

class AptisWritingSubmissionService:
    @staticmethod
    def create_submission(db: Session, user_id: int, sub_in: schemas.SubmitWriting):
        user_ans = sub_in.user_answers 
        if isinstance(user_ans, str):
            user_ans = json.loads(user_ans)

        sub = AptisWritingSubmission(
            user_id=user_id,
            test_id=sub_in.test_id,
            user_answers=user_ans, 
            status=AptisWritingStatus.PENDING.value,
            is_full_test_only=sub_in.is_full_test_only,
            submitted_at=datetime.now(),
        )
        
        sub.score = 0
        sub.cefr_level = "A0"
        
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return AptisWritingSubmissionService.get_submission_detail(db, sub.id)

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(AptisWritingSubmission).options(joinedload(AptisWritingSubmission.test))\
                 .filter(AptisWritingSubmission.user_id == user_id, AptisWritingSubmission.is_full_test_only == False)\
                 .order_by(AptisWritingSubmission.submitted_at.desc())\
                 .all()
    
    @staticmethod
    def get_submission_detail(db: Session, sub_id: int):
        return db.query(AptisWritingSubmission)\
                 .options(
                    joinedload(AptisWritingSubmission.user), 
                     joinedload(AptisWritingSubmission.test)
                     .joinedload(AptisWritingTest.parts)
                     .joinedload(AptisWritingPart.questions),
                     joinedload(AptisWritingSubmission.grader) 
                 )\
                 .filter(AptisWritingSubmission.id == sub_id)\
                 .first()

    # --- ADMIN: SUBMISSION MANAGEMENT & MANUAL GRADING ---
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, is_full_test_only: Optional[bool] = False, status_filter: Optional[str] = None, actor=None):
        query = db.query(AptisWritingSubmission).options(
            joinedload(AptisWritingSubmission.user),
            joinedload(AptisWritingSubmission.test),
            joinedload(AptisWritingSubmission.grader)
        )
        if actor is not None:
            query = apply_teacher_submission_scope(query, AptisWritingSubmission, actor)
        if is_full_test_only is not None:
            query = query.filter(AptisWritingSubmission.is_full_test_only == is_full_test_only)
        if status_filter:
            query = query.filter(AptisWritingSubmission.status == status_filter)
            
        total_count = query.count()
        items = query.order_by(AptisWritingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total_count,
            "items": items
        }

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(AptisWritingSubmission).options(
            joinedload(AptisWritingSubmission.user),
            joinedload(AptisWritingSubmission.test),
            joinedload(AptisWritingSubmission.grader)
        ).filter(
            AptisWritingSubmission.user_id == target_user_id
        ).order_by(AptisWritingSubmission.submitted_at.desc()).all()

    @staticmethod
    def grade_submission(db: Session, submission_id: int, grader_id: int, req: schemas.WritingGradeRequest):
        sub = db.query(AptisWritingSubmission).options(joinedload(AptisWritingSubmission.test)).filter(AptisWritingSubmission.id == submission_id).first()
        if not sub:
            return None
            
        sub.score = req.score
        sub.cefr_level = req.cefr_level
        
        if req.teacher_feedback is not None:
            sub.teacher_feedback = req.teacher_feedback
            
        if req.overall_feedback is not None:
            sub.overall_feedback = req.overall_feedback
            
        sub.status = AptisWritingStatus.GRADED.value
        sub.graded_at = datetime.now()
        sub.graded_by = grader_id

        # ----------------------------------------------------
        # NOTIFICATION SYSTEM
        # ----------------------------------------------------
        if not sub.is_full_test_only:
            test_title = sub.test.title if sub.test else "Writing Test"
            notification = notif_models.Notification(
                student_id=sub.user_id,
                title="Writing test graded",
                message=f'Your "{test_title}" has been graded by a teacher. You achieved CEFR level {req.cefr_level}.',
                type="SUCCESS"
            )
            db.add(notification)
            db.commit()

            # Emit to WS
            payload = {
                "id": str(notification.id),
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "created_at": notification.created_at.isoformat() if notification.created_at else datetime.now().isoformat(),
                "is_read": False
            }
            manager.send_personal_message_sync(payload, str(sub.user_id))
        else:
            db.commit()
            
            # Trigger full test recalculation to instantly send the unified notification if completed
            from app.modules.APTIS.exam.models import AptisExamSubmission
            from app.modules.APTIS.exam.services.utils import AptisExamUtils
            
            exam_sub = db.query(AptisExamSubmission).filter(
                AptisExamSubmission.writing_submission_id == sub.id
            ).first()
            if exam_sub:
                AptisExamUtils.recalculate_overall_score(db, exam_sub, auto_commit=True)
        
        return AptisWritingSubmissionService.get_submission_detail(db, submission_id)
