from fastapi import UploadFile
import os
import shutil
import uuid

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

class WritingUtils:
    @staticmethod
    def count_words(text: str) -> int:
        if not text: return 0
        return len(text.strip().split())

    @staticmethod
    def upload_image(file: UploadFile) -> str:
        """Lưu ảnh đề bài Task 1"""
        UPLOAD_DIR = "static/writing_images"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        ext = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            print(f"Error saving image: {e}")
            return ""
            
        return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    @staticmethod
    def round_ielts_score(score: float) -> float:
        if score is None: return 0.0
        decimal = score - int(score)
        if decimal < 0.25: return float(int(score))
        if decimal < 0.75: return int(score) + 0.5
        return int(score) + 1.0