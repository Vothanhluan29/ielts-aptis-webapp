import google.generativeai as genai #type: ignore
import json
import mimetypes
import time
import os
import re
from typing import List
from app.core.config import settings

# Cấu hình API Key
genai.configure(api_key=settings.GEMINI_API_KEY)

class Aptis_Speaking_Grader:
    def __init__(self):
        # Sử dụng model Flash vì khả năng xử lý Audio/Video mạnh mẽ
        self.model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash", 
            generation_config={
                "temperature": 0.2, # Hơi tăng một chút so với IELTS để AI đánh giá tự nhiên hơn
                "response_mime_type": "application/json"
            },
            system_instruction="""You are a strict, highly experienced, and certified British Council Aptis Speaking Examiner. 
            Your job is to listen to student audio responses, transcribe them accurately (including hesitation markers), 
            and grade them strictly based on the official Aptis Speaking criteria.
            Aptis evaluates task fulfillment, grammar, vocabulary, pronunciation, and fluency."""
        )

        # 🟢 CẬP NHẬT: Tiêu chí chấm điểm và Phân bổ điểm của Aptis Speaking
        # Toàn bài thi Speaking có Max Score = 50. Chúng ta sẽ chia tỷ trọng như sau:
        # Part 1 (3 câu cá nhân): Max 10 điểm
        # Part 2 (Miêu tả 1 tranh): Max 10 điểm
        # Part 3 (So sánh 2 tranh): Max 10 điểm
        # Part 4 (Thảo luận 1 tranh): Max 20 điểm
        self.APTIS_RUBRIC = """
        OFFICIAL APTIS SPEAKING GRADING CRITERIA (Apply strictly):
        
        Evaluate the candidate based on 4 dimensions:
        1. Task Fulfillment: Did they answer all parts of the question? Did they speak for the required time?
        2. Grammatical Range and Accuracy: Are there basic errors? Do they use complex structures where appropriate?
        3. Lexical Resource (Vocabulary): Is the vocabulary sufficient, precise, and varied?
        4. Pronunciation & Fluency: Is the speech natural, clear, and easy to understand without excessive hesitation?

        SCORING WEIGHT PER PART:
        - If grading Part 1: Maximum score is 10.
        - If grading Part 2: Maximum score is 10.
        - If grading Part 3: Maximum score is 10.
        - If grading Part 4: Maximum score is 20.
        
        PENALTIES:
        - Deduct heavily (up to 50% of the part score) if the response is completely off-topic.
        - Deduct points for excessive hesitation, long pauses (e.g., more than 5 seconds of silence), or L1 interference making it hard to understand.
        - If the audio is silent or unintelligible, the score MUST be 0.
        """

    def _clean_json_string(self, json_str: str) -> str:
        if not json_str: return "{}"
        cleaned = re.sub(r"```json\s*", "", json_str)
        cleaned = re.sub(r"```\s*$", "", cleaned)
        return cleaned.strip()

    # 🟢 CẬP NHẬT: Tham số đầu vào giờ đây nhận mảng câu hỏi (List[str]) thay vì 1 câu duy nhất
    def grade_single_part(self, audio_path: str, questions: List[str], part_number: int):
        print(f"🎤 [APTIS AI] Processing Audio Part {part_number}: {audio_path}")
        gemini_file = None
        
        try:
            if not os.path.exists(audio_path):
                print(f"File not found: {audio_path}")
                return self._return_error_result("Audio file not found on server.")

            file_size = os.path.getsize(audio_path)
            if file_size < 1024:
                return self._return_error_result("Audio file is too short or empty. Please check your microphone.")

            mime_type, _ = mimetypes.guess_type(audio_path)
            if audio_path.endswith(".webm") or mime_type == "video/webm":
                mime_type = "audio/webm"
            if not mime_type:
                mime_type = "audio/mp3"

            print(f"📤 Uploading to Gemini ({mime_type})...")
            gemini_file = genai.upload_file(audio_path, mime_type=mime_type)
            
            timeout = 60 
            start_time = time.time()

            while gemini_file.state.name == "PROCESSING":
                print("⏳ Waiting for audio processing...")
                time.sleep(2)
                gemini_file = genai.get_file(gemini_file.name)
                if time.time() - start_time > timeout:
                    raise TimeoutError("Gemini processing timed out.")

            if gemini_file.state.name == "FAILED":
                raise ValueError(f"Gemini failed to process audio file. State: {gemini_file.state.name}")

            # Chuyển mảng câu hỏi thành chuỗi để đưa vào Prompt
            questions_str = "\n".join([f"- {q}" for q in questions])
            
            # Xác định Max Score để AI biết giới hạn
            max_score = 20 if part_number == 4 else 10

            prompt = f"""
            Analyze the user's audio response for **Aptis Speaking Part {part_number}**.
            
            **Questions asked:** {questions_str}

            {self.APTIS_RUBRIC}

            Perform the following tasks step-by-step:

            1. **TRANSCRIPTION:** - Write down EXACTLY what the student said verbatim. 
               - MUST include hesitation markers (uhm, ah, pauses) to assess fluency accurately.

            2. **ERROR ANALYSIS & CORRECTION (CRITICAL FOR UI):**
               You MUST identify errors AND good usages. Categorize the `type` field EXACTLY using one of these keywords:
               - Major Errors: `"grammar"`, `"vocabulary"`, or `"pronunciation"` (e.g. dropped sounds, wrong stress).
               - Minor Slips: `"minor_slip"`.
               - Good Usages: `"excellent_vocab"` or `"good_phrase"` (For these, set the `fix` field to "Great usage!").

            3. **GRADING (Integer Number Only):**
               - Evaluate the response based on the RUBRIC provided.
               - The MAXIMUM SCORE for this Part is **{max_score}**.
               - Return ONLY an integer (e.g., 7, 8, 15). Do not return floats.

            4. **FEEDBACK:**
               - Provide constructive, brief feedback specifically for Part {part_number}. Mention what they did well and what needs improvement (focusing on Aptis criteria).

            **OUTPUT FORMAT (JSON ONLY):**
            Respond ONLY with a valid JSON object matching this exact structure:
            {{
                "transcript": "Full text of the speech including hesitations...",
                "part_score": <integer_between_0_and_{max_score}>,
                "feedback": "Your overall evaluation for this part...",
                "correction": [
                    {{
                        "text": "incorrect phrase or mispronounced word",
                        "fix": "corrected phrase or phonetic spelling",
                        "type": "grammar", 
                        "explanation": "Subject-verb agreement error."
                    }},
                    {{
                        "text": "advanced vocabulary used by student",
                        "fix": "Great usage!",
                        "type": "excellent_vocab",
                        "explanation": "Why this is a good word/idiom."
                    }}
                ]
            }}
            """

            print("🤖 AI is grading...")
            response = self.model.generate_content([prompt, gemini_file])
            
            clean_json = self._clean_json_string(response.text)
            result = json.loads(clean_json)
            
            # Ensure the score does not exceed the max score (AI hallucinations safeguard)
            if "part_score" in result:
                result["part_score"] = min(int(result["part_score"]), max_score)
                result["part_score"] = max(0, result["part_score"])
                
            return result

        except Exception as e:
            print(f"❌ Aptis Speaking AI Error: {e}")
            return self._return_error_result(f"AI Error: {str(e)}")
            
        finally:
            if gemini_file:
                try:
                    print(f"🗑️ Deleting Gemini file: {gemini_file.name}")
                    genai.delete_file(gemini_file.name)
                except Exception:
                    pass

    def _return_error_result(self, message: str):
        return {
            "transcript": "(Audio processing failed or file was empty)",
            "part_score": 0,
            "feedback": message,
            "correction": []
        }