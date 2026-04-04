from fastapi import UploadFile, HTTPException
import os
import shutil
import uuid

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

class SpeakingUtils:
    @staticmethod
    def save_audio_file(file: UploadFile) -> str:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0) 
        
        if file_size < 8192: 
            raise HTTPException(status_code=400, detail="Audio file is empty or corrupted. Please check your microphone.")

        UPLOAD_DIR = "static/speaking_audio"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        filename_orig = file.filename.lower()
        ext = filename_orig.split('.')[-1] if '.' in filename_orig else 'webm'
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            print(f"Error saving audio: {e}")
            raise HTTPException(status_code=500, detail="Could not save the audio file on server.")
        
        return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    @staticmethod
    def round_ielts_score(score: float) -> float:
        if score is None: return 0.0
        decimal = score - int(score)
        if decimal < 0.25: return float(int(score))
        if decimal < 0.75: return int(score) + 0.5
        return int(score) + 1.0