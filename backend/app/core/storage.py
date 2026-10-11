# Standard Library Imports
import os
import shutil
import uuid

# Third-Party Imports
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

async def upload_file(file: UploadFile, folder_name: str) -> str:
    """
    Save file to local static/ folder and return the URL
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

    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"} and file_size > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image file size exceeds limit (Max 10MB)")

    if file_ext in {".mp3", ".wav", ".webm", ".m4a", ".ogg", ".aac", ".flac"} and file_size > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file size exceeds limit (Max 50MB)")

    # Sanitize folder name to prevent directory traversal
    safe_folder = os.path.basename(folder_name)

    upload_dir = os.path.join("static", safe_folder)
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    try:
        # Move file pointer to the beginning before reading/saving
        file.file.seek(0)
        await file.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return localhost URL or actual base URL
        base_url = settings.BASE_URL.rstrip('/')
        url_path = f"static/{safe_folder}/{filename}"
        return f"{base_url}/{url_path}"

    except Exception as e:
        print(f"Local save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file locally")
