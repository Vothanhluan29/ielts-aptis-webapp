import os
import shutil
import uuid
import cloudinary
from cloudinary import uploader
from fastapi import UploadFile
from app.core.config import settings

# Cấu hình thông số Cloudinary từ settings
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_smart_file(file: UploadFile, folder_name: str) -> str:
    """
    Hàm upload thông minh: 
    - USE_CLOUDINARY=False (Local): Lưu vào thư mục static/
    - USE_CLOUDINARY=True (Prod): Đẩy lên Cloudinary
    """
    
    # --- TRƯỜNG HỢP 1: LƯU LOCAL (Để test ở máy) ---
    if not settings.USE_CLOUDINARY:
        file_ext = os.path.splitext(file.filename)[1].lower()
        upload_dir = f"static/{folder_name}"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, filename)
        
        try:
            # Di chuyển con trỏ file về đầu trước khi đọc/lưu
            await file.seek(0)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Trả về link localhost
            base_url = settings.BASE_URL.rstrip('/')
            return f"{base_url}/{upload_dir}/{filename}"
        except Exception as e:
            print(f"❌ Lỗi lưu Local: {e}")
            return ""

    # --- TRƯỜNG HỢP 2: LƯU CLOUDINARY (Khi deploy Render) ---
    try:
        await file.seek(0) # Đảm bảo đọc từ đầu file
        file_content = await file.read()
        
        result = uploader.upload(
            file_content, 
            folder=folder_name,
            resource_type="auto"
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"❌ Lỗi upload Cloudinary: {e}")
        return ""