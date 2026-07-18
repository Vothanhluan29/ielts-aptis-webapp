from sqlalchemy.orm import Session, joinedload
from app.modules.feedbacks import models, schemas

def get_feedback(db: Session, feedback_id: int):
    return db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()

def get_feedbacks_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Feedback).filter(models.Feedback.user_id == user_id).order_by(models.Feedback.created_at.desc()).offset(skip).limit(limit).all()

def get_all_feedbacks(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(models.Feedback).options(joinedload(models.Feedback.user))
    if status:
        query = query.filter(models.Feedback.status == status)
    return query.order_by(models.Feedback.created_at.desc()).offset(skip).limit(limit).all()

def create_feedback(db: Session, feedback: schemas.FeedbackCreate, user_id: int):
    db_feedback = models.Feedback(
        **feedback.dict(),
        user_id=user_id
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def update_feedback(db: Session, feedback_id: int, feedback_update: schemas.FeedbackUpdate):
    db_feedback = get_feedback(db, feedback_id)
    if not db_feedback:
        return None
    
    update_data = feedback_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_feedback, key, value)
        
    db.commit()
    db.refresh(db_feedback)
    return db_feedback
