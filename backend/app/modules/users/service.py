from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.modules.users.models import User, UserRole
from app.modules.users import schemas
from app.core.security import get_password_hash, verify_password
from app.core.cloudinary import upload_smart_file

class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def create(db: Session, user_in: schemas.UserCreate):
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    async def upload_avatar(db: Session, user: User, file: UploadFile): 
        # 1. Validate file
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        avatar_url = await upload_smart_file(file, folder_name="avatars")
        
        if not avatar_url:
            raise HTTPException(status_code=500, detail="Failed to upload avatar")
   
        user.avatar_url = avatar_url
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def change_password(db: Session, user: User, password_in: schemas.ChangePassword):
        if not verify_password(password_in.current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect current password")
        user.hashed_password = get_password_hash(password_in.new_password)
        db.add(user)
        db.commit()
        return {"message": "Password updated successfully"}

    @staticmethod
    def get_user_with_stats(db: Session, user: User):
        db.refresh(user)
        return user

    # --- UPDATE USER ---

    @staticmethod
    def update_user(db: Session, user: User, user_in: schemas.UserUpdate | schemas.UserUpdateAdmin):
        update_data = user_in.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(user, key, value)

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    # --- ADMIN CONTROL(GET, DELETE) ---

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10):
        total_count = db.query(User).count()
        users = db.query(User).order_by(User.id.desc()).offset(skip).limit(limit).all()
    
        return {
        "items": users,
        "total": total_count,
        "page": (skip // limit) + 1,
        "size": limit
    }

    @staticmethod
    def delete_user(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}