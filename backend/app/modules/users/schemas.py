from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from app.core.url_helpers import rewrite_static_url

# --- Base ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# --- Input ---
class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserUpdateAdmin(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None       # Admin only
    is_active: Optional[bool] = None # Admin only
    student_id: Optional[str] = None
    class_code: Optional[str] = None

class StudentImport(BaseModel):
    student_id: str
    class_code: Optional[str] = None
    full_name: Optional[str] = None

class TeacherClassAssign(BaseModel):
    class_codes: List[str]

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

# --- Output ---
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    role: str
    student_id: Optional[str] = None
    class_code: Optional[str] = None
    managed_classes: Optional[List[str]] = None

    @field_validator('avatar_url', mode='after')
    @classmethod
    def fix_avatar_url(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True

# --- Pagination ---
class UserPaginationResponse(BaseModel):
    items: List[UserResponse] 
    total: int                
    page: int               
    size: int               