from fastapi import UploadFile
import os
from app.core.storage import upload_file

class ListeningUtils:
    @staticmethod
    async def save_image_file(file: UploadFile) -> str: 
        """Save an image file to Cloudinary/Local and return the URL"""
        try:
            allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in allowed_extensions:
                raise ValueError(f"Invalid image format. Supported formats: {', '.join(allowed_extensions)}")

            image_url = await upload_file(file, folder_name="ielts_listening_images")
            
            if not image_url:
                raise ValueError("Could not save the image file.")

            return image_url
        except Exception as e:
            raise ValueError(f"Error saving image: {str(e)}")

    @staticmethod
    async def save_audio_file(file: UploadFile) -> str:
        """Save an audio file to Cloudinary/Local and return the URL"""
        try:
            allowed_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".aac"}
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in allowed_extensions:
                raise ValueError(f"Invalid format. Supported formats: {', '.join(allowed_extensions)}")


            audio_url = await upload_file(file, folder_name="ielts_listening_audio")
            
            if not audio_url:
                raise ValueError("Could not save the audio file.")

            return audio_url
        except Exception as e:
            raise ValueError(f"Error saving file: {str(e)}")

    @staticmethod
    def calculate_ielts_band(correct_count: int) -> float:
        """Official IELTS Academic/General Listening band scale"""
        if correct_count >= 39: return 9.0
        if correct_count >= 37: return 8.5
        if correct_count >= 35: return 8.0
        if correct_count >= 32: return 7.5
        if correct_count >= 30: return 7.0
        if correct_count >= 26: return 6.5
        if correct_count >= 23: return 6.0
        if correct_count >= 18: return 5.5
        if correct_count >= 16: return 5.0
        if correct_count >= 13: return 4.5
        if correct_count >= 10: return 4.0
        return 0.0

    @staticmethod
    def clean_text(text) -> str:
        if text is None: return ""
        return " ".join(str(text).strip().lower().split())

    @staticmethod
    def check_is_correct(user_ans, correct_answers: list, options=None) -> bool:
        if user_ans is None or user_ans == "" or user_ans == []:
            return False
        if not correct_answers:
            return False

        accepted_cleaned = [ListeningUtils.clean_text(ans) for ans in correct_answers]

        if isinstance(user_ans, list):
            user_cleaned = [ListeningUtils.clean_text(a) for a in user_ans]
            return set(user_cleaned) == set(accepted_cleaned)

        cleaned_student = ListeningUtils.clean_text(user_ans)
        
        # 1. Direct match check
        if cleaned_student in accepted_cleaned:
            return True
            
        # 2. Map options check
        if options:
            import json
            opts = options
            if isinstance(opts, str):
                try:
                    opts = json.loads(opts)
                except json.JSONDecodeError:
                    opts = None
            if opts:
                if isinstance(opts, dict):
                    resolved_val = opts.get(str(user_ans))
                    if resolved_val:
                        resolved_student = ListeningUtils.clean_text(resolved_val)
                        if resolved_student in accepted_cleaned:
                            return True
                elif isinstance(opts, list):
                    cleaned_opts = [ListeningUtils.clean_text(opt) for opt in opts]
                    # TH1: correct_answer is index ("0"), but student sent text ("dog")
                    if cleaned_student in cleaned_opts:
                        idx = cleaned_opts.index(cleaned_student)
                        if str(idx) in accepted_cleaned:
                            return True
                    # TH2: correct_answer is text ("dog"), but student sent index ("0")
                    else:
                        try:
                            idx = int(str(user_ans))
                            if 0 <= idx < len(opts):
                                resolved_student = ListeningUtils.clean_text(opts[idx])
                                if resolved_student in accepted_cleaned:
                                    return True
                        except ValueError:
                            pass
                            
        return False