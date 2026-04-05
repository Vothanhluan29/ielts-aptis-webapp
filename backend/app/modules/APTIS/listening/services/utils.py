from fastapi import UploadFile, HTTPException, status
import os
import shutil
import uuid

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

class AptisListeningUtils:
    @staticmethod
    def save_audio_file(file: UploadFile) -> str:
        allowed_extensions = {".mp3", ".wav", ".ogg", ".m4a"}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
            )

        UPLOAD_DIR = "static/audio/aptis_listening"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
            
        return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    @staticmethod
    def normalize_answer(text: str) -> str:
        if not text: return ""
        cleaned = str(text).strip().lower()
        if cleaned.endswith('.'): cleaned = cleaned[:-1]
        return " ".join(cleaned.split())

    @staticmethod
    def calculate_aptis_score_and_cefr(correct_count: int, total_questions: int = 25) -> dict:
        if total_questions > 0:
            scale_score = round((correct_count / total_questions) * 50)
        else:
            scale_score = 0

        cefr = "A0"
        if correct_count >= 21:    cefr = "C"
        elif correct_count >= 17:  cefr = "B2"
        elif correct_count >= 12:  cefr = "B1"
        elif correct_count >= 6:   cefr = "A2"
        elif correct_count >= 1:   cefr = "A1"
            
        return {
            "score": scale_score,
            "cefr_level": cefr
        }