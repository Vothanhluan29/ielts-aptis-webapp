from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, Query, Cookie
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.modules.users.models import User
from app.modules.users.service import UserService
from app.modules.notifications import models, schemas
from app.core.websockets import manager

router = APIRouter(prefix="/notifications", tags=["Notifications"])

async def get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = UserService.get_by_email(db, email=email)
        return user
    except JWTError:
        return None

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    access_token: str = Cookie(None),
    token: str = Query(None), 
    db: Session = Depends(get_db)
):
    # Prioritize HttpOnly Cookie over query parameter
    actual_token = access_token or token
    if not actual_token:
        await websocket.close(code=1008)
        return

    user = await get_user_from_token(actual_token, db)
    if not user:
        await websocket.close(code=1008)
        return

    student_id = str(user.id)
    await manager.connect(websocket, student_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection open
    except WebSocketDisconnect:
        manager.disconnect(websocket, student_id)


@router.get("", response_model=List[schemas.NotificationResponse])
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for the current user"""
    notifications = db.query(models.Notification)\
        .filter(models.Notification.student_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .offset(skip).limit(limit).all()
    return notifications

@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read"""
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.student_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all", response_model=dict)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for current user"""
    db.query(models.Notification).filter(
        models.Notification.student_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/clear-all", response_model=dict)
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all notifications for current user"""
    db.query(models.Notification).filter(
        models.Notification.student_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "All notifications cleared"}
