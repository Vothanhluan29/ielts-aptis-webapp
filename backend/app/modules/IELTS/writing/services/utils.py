from fastapi import UploadFile
from app.core.cloudinary import upload_smart_file

class WritingUtils:
    @staticmethod
    def count_words(text: str) -> int:
        if not text: return 0
        return len(text.strip().split())

    @staticmethod
    async def upload_image(file: UploadFile) -> str: 

        image_url = await upload_smart_file(file, folder_name="ielts_writing_images")
        
        if not image_url:
            print("Error saving Writing Task 1 image.")
            return ""
            
        return image_url

    @staticmethod
    def round_ielts_score(score: float) -> float:
        if score is None: return 0.0
        decimal = score - int(score)
        if decimal < 0.25: return float(int(score))
        if decimal < 0.75: return int(score) + 0.5
        return int(score) + 1.0