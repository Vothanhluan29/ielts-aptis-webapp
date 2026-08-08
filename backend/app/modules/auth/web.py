from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core import security
from app.core.config import settings
from app.core.rate_limiter import limiter
from app.modules.auth import schemas as auth_schemas
from app.modules.auth.service import AuthService
from app.modules.users import schemas as user_schemas
from app.modules.auth.schemas import GoogleLoginSchemas
from app.modules.users.service import UserService
from app.modules.users.models import RefreshToken, User

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_refresh_token_cookie_and_db(db: Session, response: Response, user_id: int):
    now = datetime.now(timezone.utc)
    
    # Cleanup expired tokens for this user
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.expires_at < now
    ).delete(synchronize_session=False)
    
    refresh_token = security.create_refresh_token()
    expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Store in DB
    db_token = RefreshToken(
        token=refresh_token,
        user_id=user_id,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

@router.post("/register", response_model=user_schemas.UserResponse)
@limiter.limit("3/minute")
def register(request: Request, user_in: user_schemas.UserCreate, db: Session = Depends(get_db)):
    if UserService.get_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return UserService.create(db, user_in)

@router.post("/login", response_model=auth_schemas.Token)
@limiter.limit("5/minute")
def login(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = AuthService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )
    
    set_refresh_token_cookie_and_db(db, response, user.id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=auth_schemas.Token)
@limiter.limit("10/minute")
def login_google(
    request: Request,
    login_data: GoogleLoginSchemas, 
    response: Response,
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
    
    set_refresh_token_cookie_and_db(db, response, user.id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=auth_schemas.Token)
@limiter.limit("10/minute")
def refresh_token(
    request: Request,
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
    
    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    if db_token.is_revoked:
        raise HTTPException(status_code=401, detail="Refresh token revoked")
        
    # Python datetimes from DB might be naive, convert or compare carefully
    now = datetime.now(timezone.utc)
    if db_token.expires_at.tzinfo is None:
        db_expires_at = db_token.expires_at.replace(tzinfo=timezone.utc)
    else:
        db_expires_at = db_token.expires_at
        
    if db_expires_at < now:
        raise HTTPException(status_code=401, detail="Refresh token expired")
        
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive or not found")
        
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    # Refresh Token Rotation: Revoke current token and generate a new one
    db_token.is_revoked = True
    db.commit()
    set_refresh_token_cookie_and_db(db, response, user.id)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response, refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    if refresh_token:
        db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        if db_token:
            db_token.is_revoked = True
            db.commit()
    response.delete_cookie("refresh_token")
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}