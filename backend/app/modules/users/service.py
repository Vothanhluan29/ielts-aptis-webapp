from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.modules.users.models import User, UserRole
from app.modules.users import schemas
from app.core.security import get_password_hash, verify_password
from app.core.storage import upload_file

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

        avatar_url = await upload_file(file, folder_name="avatars")
        
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
        if str(getattr(user.role, "value", user.role)).lower() == UserRole.TEACHER.value:
            user.managed_classes = [assignment.class_code for assignment in user.teacher_classes]
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
    def get_all(db: Session, skip: int = 0, limit: int = 10, role: str = None, class_code: str = None):
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        if class_code:
            query = query.filter(User.class_code == class_code)
            
        total_count = query.count()
        users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()
        
        for user in users:
            if user.role == UserRole.TEACHER:
                user.managed_classes = [tc.class_code for tc in user.teacher_classes]
    
        return {
        "items": users,
        "total": total_count,
        "page": (skip // limit) + 1,
        "size": limit
    }

    @staticmethod
    def delete_user(db: Session, user_id: int):
        from sqlalchemy.exc import IntegrityError
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        try:
            db.delete(user)
            db.commit()
            return {"message": "User deleted successfully"}
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete user because they have associated records. Please remove them first."
            )
        
    @staticmethod
    def bulk_create_students(db: Session, students_in: list[schemas.StudentImport]):
        created_users = []
        for student in students_in:
            # Check if exists
            existing = db.query(User).filter(User.student_id == student.student_id).first()
            if not existing:
                # Use a structured initial password f"{student_id}@Aptis2026"
                initial_password = f"{student.student_id}@Aptis2026"
                email = f"{student.student_id}@student.edu"
                db_user = User(
                    email=email,
                    hashed_password=get_password_hash(initial_password),
                    full_name=student.full_name,
                    student_id=student.student_id,
                    class_code=student.class_code,
                    role=UserRole.STUDENT,
                    is_active=True
                )
                db.add(db_user)
                created_users.append(db_user)
        db.commit()
        return {"message": f"{len(created_users)} students imported successfully."}

    @staticmethod
    def assign_teacher_classes(db: Session, teacher_id: int, class_codes: list[str]):
        from app.modules.users.models import TeacherClass
        
        teacher = db.query(User).filter(User.id == teacher_id, User.role == UserRole.TEACHER).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
            
        # Delete existing mappings
        db.query(TeacherClass).filter(TeacherClass.user_id == teacher_id).delete()
        
        # Add new mappings
        for code in class_codes:
            tc = TeacherClass(user_id=teacher_id, class_code=code)
            db.add(tc)
            
        db.commit()
        return {"message": "Classes assigned successfully"}
