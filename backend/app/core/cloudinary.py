# Standard Library Imports
import os
import shutil
import uuid

# Third-Party Imports
import cloudinary
from cloudinary import uploader
from fastapi import HTTPException, UploadFile

# Local Application Imports
from app.core.config import settings

# Whitelist allowed media extensions
ALLOWED_EXTENSIONS = {
    # Audio
    ".mp3", ".wav", ".webm", ".m4a", ".ogg", ".aac", ".flac",
    # Images
    ".jpg", ".jpeg", ".png", ".gif", ".webp"
}

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
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is empty")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File extension '{file_ext}' is not allowed. Permitted: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # File size limits
    MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50MB
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

    await file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    await file.seek(0)

    if file_ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"} and file_size > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image file size exceeds limit (Max 10MB)")

    if file_ext in {".mp3", ".wav", ".webm", ".m4a", ".ogg", ".aac", ".flac"} and file_size > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file size exceeds limit (Max 50MB)")

    # Sanitize folder name to prevent directory traversal
    safe_folder = os.path.basename(folder_name)

    # CASE 1: SAVE LOCALLY (for local testing)
    if not settings.USE_CLOUDINARY:
        upload_dir = os.path.join("static", safe_folder)
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
            url_path = f"static/{safe_folder}/{filename}"
            return f"{base_url}/{url_path}"

        except Exception as e:
            print(f"Local save error: {e}")
            raise HTTPException(status_code=500, detail="Failed to save file locally")

    # CASE 2: UPLOAD TO CLOUDINARY (when deployed)
    try:
        await file.seek(0)  # Ensure reading from the beginning
        file_content = await file.read()

        result = uploader.upload(
            file_content,
            folder=safe_folder,
            resource_type="auto"
        )

        return result.get("secure_url")

    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file to Cloudinary")