from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.subscriptions.models import UserUsage

class SubscriptionService:
    
    @staticmethod
    def get_or_create_usage(db: Session, user_id: int):
        usage = db.query(UserUsage).filter(UserUsage.user_id == user_id).first()
        if not usage:
            usage = UserUsage(user_id=user_id)
            db.add(usage)
            db.commit()
            db.refresh(usage)
        return usage

    @staticmethod
    def check_and_increment_quota(db: Session, user_id: int, type: str):
        usage = SubscriptionService.get_or_create_usage(db, user_id)
        
        if type == 'SPEAKING':
            if usage.speaking_used >= usage.speaking_limit:
                raise HTTPException(
                    status_code=403,
                    detail="You have reached your Speaking grading limit for this session (Resets at 00:00 & 12:00)."
                )
            usage.speaking_used += 1
            
        elif type == 'WRITING':
            if usage.writing_used >= usage.writing_limit:
                raise HTTPException(
                    status_code=403,
                    detail="You have reached your Writing grading limit for this session (Resets at 00:00 & 12:00)."
                )
            usage.writing_used += 1

        elif type == "EXAM":
            if usage.exam_used >= usage.exam_limit:
                raise HTTPException(
                    status_code=403,
                    detail="You have reached your Exam attempt limit for this session."
                )
            usage.exam_used += 1
            
        db.commit()
        db.refresh(usage)
        return True

    @staticmethod
    def reset_all_quotas(db: Session):
        """This function is used by the Scheduler to reset all quotas"""
        try:
            # Reset all "used" columns to 0 for all users
            db.query(UserUsage).update({
                UserUsage.speaking_used: 0,
                UserUsage.writing_used: 0,
                UserUsage.exam_used: 0
            })
            db.commit()
            print("[SCHEDULER] All quotas have been reset.")
        except Exception as e:
            print(f"[SCHEDULER] Error resetting quotas: {e}")
            db.rollback()