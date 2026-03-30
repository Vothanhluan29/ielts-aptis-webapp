import os

def create_auth_project():
    base_dir = "backend"
    
    # ==========================================
    # 1. NỘI DUNG CODE (Content definitions)
    # ==========================================

    # [1] Requirements
    content_requirements = """fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-dotenv
pydantic-settings
python-multipart
python-jose[cryptography]
passlib[argon2]
argon2-cffi
"""

    # [2] .env (Cấu hình môi trường)
    content_env = """DATABASE_URL=postgresql://postgres:123456@localhost:5432/ielts_db
SECRET_KEY=thay_doi_key_nay_de_bao_mat_hon_nhe
ACCESS_TOKEN_EXPIRE_MINUTES=60
"""

    # [3] Config
    content_config = """import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IELTS Auth System"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        # Trỏ ra file .env ở thư mục backend (ngang hàng folder app)
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        case_sensitive = True

settings = Settings()
"""

    # [4] Database
    content_database = """from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

    # [5] Security (Argon2 + JWT)
    content_security = """from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from app.core.config import settings

# Cấu hình Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
"""

    # [6] Dependencies (Bảo vệ API)
    content_dependencies = """from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.modules.users.service import UserService
from app.modules.users.models import UserRole

# Đường dẫn login cho Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = UserService.get_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def get_admin_user(current_user = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user
"""

    # [7] Users - Models
    content_users_models = """import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(String, default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
"""

    # [8] Users - Schemas
    content_users_schemas = """from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True
"""

    # [9] Users - Service
    content_users_service = """from sqlalchemy.orm import Session
from app.modules.users.models import User, UserRole
from app.modules.users.schemas import UserCreate
from app.core.security import get_password_hash

class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, user_in: UserCreate):
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
"""

    # [10] Users - Web
    content_users_web = """from fastapi import APIRouter, Depends
from app.modules.users import schemas
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user = Depends(get_current_user)):
    return current_user
"""

    # [11] Auth - Schemas
    content_auth_schemas = """from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
"""

    # [12] Auth - Service
    content_auth_service = """from sqlalchemy.orm import Session
from app.modules.users.service import UserService
from app.core.security import verify_password

class AuthService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str):
        user = UserService.get_by_email(db, email)
        if not user: return None
        if not verify_password(password, user.hashed_password): return None
        return user
"""

    # [13] Auth - Web (Sửa lỗi 422 Swagger bằng OAuth2PasswordRequestForm)
    content_auth_web = """from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core import security
from app.modules.auth import schemas as auth_schemas
from app.modules.auth.service import AuthService
from app.modules.users import schemas as user_schemas
from app.modules.users.service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=user_schemas.UserResponse)
def register(user_in: user_schemas.UserCreate, db: Session = Depends(get_db)):
    if UserService.get_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return UserService.create(db, user_in)

@router.post("/login", response_model=auth_schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Swagger gửi 'username' nhưng ta hiểu là 'email'
    user = AuthService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}
"""

    # [14] Main
    content_main = """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base

# Import Models để tạo bảng
from app.modules.users.models import User

# Import Routers
from app.modules.auth import web as auth_web
from app.modules.users import web as users_web

# Tạo bảng DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_web.router)
app.include_router(users_web.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Auth System Ready!"}
"""

    # ==========================================
    # 2. CẤU TRÚC FOLDER VÀ GHI FILE
    # ==========================================
    structure = {
        "backend/requirements.txt": content_requirements,
        "backend/.env": content_env,
        
        "backend/app/__init__.py": "",
        "backend/app/main.py": content_main,
        
        "backend/app/core/__init__.py": "",
        "backend/app/core/config.py": content_config,
        "backend/app/core/database.py": content_database,
        "backend/app/core/security.py": content_security,
        "backend/app/core/dependencies.py": content_dependencies,
        
        "backend/app/modules/__init__.py": "",
        
        "backend/app/modules/users/__init__.py": "",
        "backend/app/modules/users/models.py": content_users_models,
        "backend/app/modules/users/schemas.py": content_users_schemas,
        "backend/app/modules/users/service.py": content_users_service,
        "backend/app/modules/users/web.py": content_users_web,
        
        "backend/app/modules/auth/__init__.py": "",
        "backend/app/modules/auth/service.py": content_auth_service,
        "backend/app/modules/auth/schemas.py": content_auth_schemas,
        "backend/app/modules/auth/web.py": content_auth_web,
    }

    print("🚀 Đang khởi tạo dự án Authentication...")
    
    for path, content in structure.items():
        # Đảm bảo folder tồn tại
        os.makedirs(os.path.dirname(path), exist_ok=True)
        # Ghi file
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✅ Created: {path}")

    print("\n🎉 SETUP HOÀN TẤT! HÃY LÀM THEO ĐÚNG CÁC BƯỚC SAU:")
    print("1. Mở terminal.")
    print("2. Chạy lệnh: cd backend")
    print("3. Cài thư viện: pip install -r requirements.txt")
    print("4. (Quan trọng) Chạy server bằng lệnh:")
    print("   uvicorn app.main:app --reload")

if __name__ == "__main__":
    create_auth_project()