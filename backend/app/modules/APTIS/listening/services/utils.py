from fastapi import UploadFile, HTTPException, status
import os

from app.core.cloudinary import upload_smart_file 

class AptisListeningUtils:
    @staticmethod
    async def save_audio_file(file: UploadFile) -> str:
        # Kiểm tra định dạng file
        allowed_extensions = {".mp3", ".wav", ".ogg", ".m4a"}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Định dạng file không hợp lệ. Chỉ chấp nhận: {', '.join(allowed_extensions)}"
            )
        audio_url = await upload_smart_file(file, folder_name="aptis_listening")
        
        if not audio_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Lỗi trong quá trình lưu file audio."
            )
            
        return audio_url

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