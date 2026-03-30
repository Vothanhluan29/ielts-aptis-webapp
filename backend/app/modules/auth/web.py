from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core import security
from app.modules.auth import schemas as auth_schemas
from app.modules.auth.service import AuthService
from app.modules.users import schemas as user_schemas
from app.modules.auth.schemas import GoogleLoginSchemas
from app.modules.users.service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=user_schemas.UserResponse)
def register(user_in: user_schemas.UserCreate, db: Session = Depends(get_db)):
    if UserService.get_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return UserService.create(db, user_in)

@router.post("/login", response_model=auth_schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = AuthService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=auth_schemas.Token)
def login_google(
    login_data: GoogleLoginSchemas, 
    db: Session = Depends(get_db)
):
    user = AuthService.google_login(db, token=login_data.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid Google Token"
        )
    
    # Tạo Access Token của hệ thống mình (JWT)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


""