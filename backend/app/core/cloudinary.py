import os
import shutil
import uuid
import cloudinary
from cloudinary import uploader
from fastapi import UploadFile
from app.core.config import settings

# Configure Cloudinary settings
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_smart_file(file: UploadFile, folder_name: str) -> str:
    """
    Smart upload function:
    - USE_CLOUDINARY=False (Local): Save file to static/ folder
    - USE_CLOUDINARY=True (Production): Upload file to Cloudinary
    """

    # CASE 1: SAVE LOCALLY (for local testing)
    if not settings.USE_CLOUDINARY:
        file_ext = os.path.splitext(file.filename)[1].lower()
        upload_dir = f"static/{folder_name}"
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, filename)

        try:
            # Move file pointer to the beginning before reading/saving
            await file.seek(0)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Return localhost URL
            base_url = settings.BASE_URL.rstrip('/')
            return f"{base_url}/{upload_dir}/{filename}"

        except Exception as e:
            print(f"Local save error: {e}")
            return ""

    # CASE 2: UPLOAD TO CLOUDINARY (when deployed)
    try:
        await file.seek(0)  # Ensure reading from the beginning
        file_content = await file.read()

        result = uploader.upload(
            file_content,
            folder=folder_name,
            resource_type="auto"
        )

        return result.get("secure_url")

    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return ""