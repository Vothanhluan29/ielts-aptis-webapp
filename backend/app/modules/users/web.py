from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.modules.users import schemas
from app.modules.users.service import UserService
from app.core.dependencies import get_current_user, get_admin_user
from app.core.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

# --- SECTION 1: STUDENT / USER ROLE (Các thao tác cá nhân) ---
# Đặt /me lên đầu để không bị nhầm với /{user_id} của Admin

@router.get("/me", response_model=schemas.UserResponse)
def get_users_me(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin chính mình.
    Hàm này gọi get_user_with_stats để db.refresh(user) dữ liệu mới nhất.
    """
    return UserService.get_user_with_stats(db, current_user)

@router.patch("/me/avatar", response_model=schemas.UserResponse)
async def update_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Cập nhật ảnh đại diện người dùng."""
    return await   UserService.upload_avatar(db, current_user, file)

@router.patch("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Cập nhật thông tin họ tên cá nhân."""
    return UserService.update_user(db, current_user, user_update)

@router.post("/me/password")
def change_password(
    password_data: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Thay đổi mật khẩu tài khoản."""
    return UserService.change_password(db, current_user, password_data)


# --- SECTION 2: ADMIN ROLE (Các thao tác quản lý) ---
@router.get("/", response_model=schemas.UserPaginationResponse)
def get_all_users_by_admin(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user) 
):
    """Admin lấy danh sách tất cả học viên kèm phân trang."""
    return UserService.get_all(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    """Admin lấy chi tiết một học viên qua ID."""
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user_by_admin(
    user_id: int,
    user_update: schemas.UserUpdateAdmin, 
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    """Admin cập nhật thông tin học viên bất kỳ."""
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserService.update_user(db, user, user_update)

@router.delete("/{user_id}")
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    """Admin xóa tài khoản học viên."""
    return UserService.delete_user(db, user_id)