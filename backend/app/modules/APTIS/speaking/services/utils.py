from fastapi import UploadFile, HTTPException
import os
from app.core.cloudinary import upload_smart_file

class AptisSpeakingUtils:
    @staticmethod
    async def save_audio_file(file: UploadFile) -> str:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size < 1024:
            raise HTTPException(
                status_code=400, 
                detail="Audio file is empty or corrupted. Please check your microphone."
            )

        audio_url = await upload_smart_file(file, folder_name="aptis_speaking_audio")
        
        if not audio_url:
            raise HTTPException(
                status_code=500, 
                detail="Could not save the audio file on server."
            )
        
        return audio_url

    @staticmethod
    async def upload_image(file: UploadFile) -> str:
        image_url = await upload_smart_file(file, folder_name="aptis_speaking_images")

        if not image_url:
            print("Error saving image to Cloudinary/Local")
            return ""
            
        return image_url