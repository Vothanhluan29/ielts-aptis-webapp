import os
import shutil
import uuid
import cloudinary
from cloudinary import uploader # Đã sửa cách import để VS Code không báo lỗi
from fastapi import UploadFile
from app.core.config import settings

# Cấu hình Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_smart_file(file: UploadFile, folder_name: str) -> str:
    """
    Hàm upload thông minh: Tự động chọn lưu Local hoặc lên Cloudinary
    dựa vào biến môi trường USE_CLOUDINARY.
    """
    
    # ==========================================
    # 1. CHẠY Ở LOCAL (Lưu vào thư mục static)
    # ==========================================
    if not settings.USE_CLOUDINARY:
        file_ext = os.path.splitext(file.filename)[1].lower()
        upload_dir = f"static/{folder_name}"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            # Trả về link localhost: http://localhost:8000/static/folder/...
            return f"{settings.BASE_URL.rstrip('/')}/{upload_dir}/{filename}"
        except Exception as e:
            print(f"❌ Lỗi lưu file Local: {e}")
            return ""

    # ==========================================
    # 2. CHẠY TRÊN PRODUCTION (Đẩy lên Cloudinary)
    # ==========================================
    try:
        file_content = await file.read()
        result = uploader.upload(
            file_content, 
            folder=folder_name,
            resource_type="auto" # Tự động nhận diện ảnh hay audio/video
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"❌ Lỗi upload Cloudinary: {e}")
        return ""