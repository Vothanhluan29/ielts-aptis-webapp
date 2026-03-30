from sqlalchemy.orm import Session
from app.modules.users.service import UserService
from app.core.security import verify_password
import uuid
from sqlalchemy.orm import Session
from google.oauth2 import id_token #type:ignore
from google.auth.transport import requests as google_requests #type:ignore

from app.modules.users.models import User
from app.core.security import get_password_hash
from app.core.config import settings
class AuthService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str):
        user = UserService.get_by_email(db, email)
        if not user: return None
        if not verify_password(password, user.hashed_password): return None
        return user

    @staticmethod
    def google_login(db: Session, token: str):
        try:
            # 1. Xác thực Token với Google
            # Hàm này sẽ ném lỗi nếu token giả mạo hoặc hết hạn
            id_info = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )

            # 2. Lấy thông tin user từ Token
            email = id_info.get('email')
            name = id_info.get('name', 'Google User')
            
            if not email:
                return None

            # 3. Kiểm tra user trong DB
            user = db.query(User).filter(User.email == email).first()

            if not user:
                # 4. Nếu chưa có -> Tự động Đăng ký (Register)
                # Tạo mật khẩu ngẫu nhiên vì user này đăng nhập bằng Google
                random_password = str(uuid.uuid4()) 
                hashed_password = get_password_hash(random_password)

                new_user = User(
                    email=email,
                    full_name=name,
                    hashed_password=hashed_password,
                    role="student", # Mặc định là user thường
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                return new_user
            
            # 5. Nếu đã có -> Trả về user để tạo Access Token
            return user

        except ValueError as e:
            # Token không hợp lệ
            print(f"Google Token Error: {e}")
            return None