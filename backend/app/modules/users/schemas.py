from pydantic import BaseModel, EmailStr
from typing import Optional, List

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
    
    class Config:
        from_attributes = True

# --- Pagination ---
class UserPaginationResponse(BaseModel):
    items: List[UserResponse] 
    total: int                
    page: int               
    size: int               