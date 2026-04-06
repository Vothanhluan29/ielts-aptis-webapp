import cloudinary
from cloudinary import uploader
from fastapi import UploadFile
from app.core.config import settings # Điều chỉnh đường dẫn tới file config của bạn

# Cấu hình Cloudinary (Chạy 1 lần khi import)
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_file_to_cloudinary(file: UploadFile, folder_name: str) -> str:
    """
    Hàm tiện ích nhận vào UploadFile của FastAPI và trả về URL ảnh/audio từ Cloudinary
    """
    try:
        # Đọc nội dung file
        file_content = await file.read()
        
        # 🔥 QUAN TRỌNG: resource_type="auto" giúp Cloudinary tự nhận diện 
        # file đó là image (avatar) hay video/audio (webm speaking).
        # Nếu không có dòng này, up file ghi âm .webm sẽ bị lỗi!
        result = uploader.upload(
            file_content, 
            folder=folder_name,
            resource_type="auto" 
        )
        
        # Trả về đường link HTTPS vĩnh viễn
        return result.get("secure_url")
        
    except Exception as e:
        print(f"Lỗi upload Cloudinary: {e}")
        return None