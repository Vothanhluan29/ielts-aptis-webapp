# Standard Library Imports
import logging
from typing import List

# Third-Party Imports
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

# Local Application Core Imports
from app.core.database import get_db
from app.core.dependencies import get_admin_user, get_aptis_manager_user, get_current_user

# Local Application Modules Imports
from app.modules.users import schemas
from app.modules.users.models import User
from app.modules.users.service import UserService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])



@router.get("/me", response_model=schemas.UserResponse)
def get_users_me(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return UserService.get_user_with_stats(db, current_user)

@router.patch("/me/avatar", response_model=schemas.UserResponse)
async def update_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await   UserService.upload_avatar(db, current_user, file)

@router.patch("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return UserService.update_user(db, current_user, user_update)

@router.post("/me/password")
def change_password(
    password_data: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return UserService.change_password(db, current_user, password_data)



@router.get("/", response_model=schemas.UserPaginationResponse)
def get_all_users_by_admin(
    skip: int = Query(0, ge=0), 
    limit: int = Query(10, ge=1, le=100),
    role: str = None,
    class_code: str = None,
    db: Session = Depends(get_db),
    manager = Depends(get_aptis_manager_user) 
):
    return UserService.get_all(db, skip=skip, limit=limit, role=role, class_code=class_code)

@router.post("/import", status_code=201)
def bulk_import_students(
    students: List[schemas.StudentImport],
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    return UserService.bulk_create_students(db, students)

@router.post("/{user_id}/classes")
def assign_classes_to_teacher(
    user_id: int,
    payload: schemas.TeacherClassAssign,
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    return UserService.assign_teacher_classes(db, user_id, payload.class_codes)

@router.get("/teacher/students", response_model=schemas.UserPaginationResponse)
def get_teacher_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    class_code: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get classes assigned to this teacher
    managed_classes = [tc.class_code for tc in current_user.teacher_classes]
    if not managed_classes:
        return {"items": [], "total": 0, "page": 1, "size": limit}
        
    query = db.query(User).filter(User.role == "student")
    if class_code:
        if class_code not in managed_classes:
            return {"items": [], "total": 0, "page": 1, "size": limit}
        query = query.filter(User.class_code == class_code)
    else:
        query = query.filter(User.class_code.in_(managed_classes))
        
    total_count = query.count()
    users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": users,
        "total": total_count,
        "page": (skip // limit) + 1,
        "size": limit
    }

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    manager = Depends(get_aptis_manager_user)
):
   
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user_by_admin(
    user_id: int,
    user_update: schemas.UserUpdateAdmin, 
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    logger.info(f"AUDIT LOG: Admin User ID {admin_user.id} updated user ID {user_id} with data {user_update.model_dump(exclude_unset=True)}")
    return UserService.update_user(db, user, user_update)

@router.delete("/{user_id}")
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    logger.info(f"AUDIT LOG: Admin User ID {admin_user.id} deleted user ID {user_id}")
    return UserService.delete_user(db, user_id)