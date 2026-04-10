from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.modules.users.service import UserService
from app.modules.users.models import UserRole

# Login endpoint path for Swagger UI
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
    # 1. Get role from DB, convert to string and make it uppercase
    role_in_db = str(current_user.role).upper()
    role_required = str(UserRole.ADMIN.value).upper()
    
    # 2. Compare roles
    if role_in_db != role_required:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. DB role is '{current_user.role}', required '{UserRole.ADMIN.value}'"
        )
    
    return current_user