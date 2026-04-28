from fastapi import UploadFile, HTTPException
import os
from app.core.cloudinary import upload_smart_file

class SpeakingUtils:
    @staticmethod
    async def save_audio_file(file: UploadFile) -> str: 

        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0) 
        
        if file_size < 8192: 
            raise HTTPException(
                status_code=400, 
                detail="Audio file is empty or corrupted. Please check your microphone."
            )

        audio_url = await upload_smart_file(file, folder_name="ielts_speaking_audio")
        
        if not audio_url:
            raise HTTPException(
                status_code=500, 
                detail="Could not save the audio file on server."
            )
        
        return audio_url

    @staticmethod
    def round_ielts_score(score: float) -> float:
        if score is None: return 0.0
        decimal = score - int(score)
        if decimal < 0.25: return float(int(score))
        if decimal < 0.75: return int(score) + 0.5
        return int(score) + 1.0