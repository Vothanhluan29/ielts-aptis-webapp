from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.modules.users.service import UserService
from app.modules.users.models import UserRole

# Login endpoint path for Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_user(request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Fallback: check cookie if header token is missing
    if not token:
        token = request.cookies.get("access_token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

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
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is suspended. Please contact your administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user


def get_admin_user(current_user = Depends(get_current_user)):
    # 1. Get role from DB, convert to string and make it uppercase
    role_in_db = str(current_user.role).upper()
    role_required = str(UserRole.ADMIN.value).upper()
    
    # 2. Compare roles robustly (handle Python 3.11 enum stringification)
    if role_required not in role_in_db:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. DB role is '{current_user.role}', required '{UserRole.ADMIN.value}'"
        )
    
    return current_user


def get_aptis_manager_user(current_user = Depends(get_current_user)):
    role_in_db = str(current_user.role).upper()
    role_admin = str(UserRole.ADMIN.value).upper()
    role_teacher = str(UserRole.TEACHER.value).upper()
    
    if role_admin not in role_in_db and role_teacher not in role_in_db:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. Role '{current_user.role}' is not allowed."
        )
    return current_user