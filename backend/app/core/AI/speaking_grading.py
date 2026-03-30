import google.generativeai as genai #type: ignore
import json
import mimetypes
import time
import os
import re
import logging
from app.core.config import settings

# Cấu hình Logger cơ bản cho module này
logger = logging.getLogger(__name__)

# Cấu hình API Key
genai.configure(api_key=settings.GEMINI_API_KEY)

class IELTS_Speaking_Grader:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash-lite", 
            generation_config={
                "temperature": 0.1, 
                "response_mime_type": "application/json"
            },
            system_instruction="""You are a strict, highly experienced, and certified IELTS Speaking Examiner. 
            Your job is to listen to student audio responses, transcribe them accurately, and grade them strictly based on the official IELTS Speaking Band Descriptors. 
            Do not inflate scores. Pay close attention to pronunciation (L1 interference) and fluency."""
        )

        self.SPEAKING_RUBRIC = """
        OFFICIAL IELTS SPEAKING BAND DESCRIPTORS (Apply strictly):
        
        1. FLUENCY AND COHERENCE (FC):
           - Band 9: Speaks fluently with rare repetition/self-correction; fully appropriate cohesive features.
           - Band 8: Speaks fluently; occasional repetition; develops topics coherently.
           - Band 7: Speaks at length without noticeable effort; uses a range of connectives with some flexibility.
           - Band 6: Willing to speak at length, but may lose coherence at times due to repetition/hesitation.
           - Band 5: Usually maintains flow but uses repetition, self-correction, or slow speech to keep going.
           
        2. LEXICAL RESOURCE (LR):
           - Band 8: Uses a wide vocabulary readily; uses less common/idiomatic vocabulary skilfully.
           - Band 7: Uses vocabulary flexibly; uses some less common/idiomatic vocabulary with some awareness of style/collocation.
           - Band 6: Wide enough vocabulary to discuss topics at length; generally paraphrases successfully.
           - Band 5: Manages to talk about familiar/unfamiliar topics but with limited flexibility.

        3. GRAMMATICAL RANGE AND ACCURACY (GRA):
           - Band 8: Wide range of structures flexibly; majority of error-free sentences.
           - Band 7: Range of complex structures with some flexibility; frequently produces error-free sentences.
           - Band 6: Mix of simple and complex structures; frequent mistakes with complex structures but rarely cause comprehension problems.
           - Band 5: Produces basic sentence forms with reasonable accuracy; limited complex structures with errors.

        4. PRONUNCIATION (PR):
           - Band 8: Easy to understand throughout; L1 accent has minimal effect on intelligibility.
           - Band 7: Shows all positive features of Band 6 and some of Band 8.
           - Band 6: Can generally be understood throughout, though mispronunciation of individual words/sounds reduces clarity at times.
           - Band 5: Shows all positive features of Band 4 and some of Band 6.
        """

    def _clean_json_string(self, json_str: str) -> str:
        if not json_str: return "{}"
        cleaned = re.sub(r"```json\s*", "", json_str)
        cleaned = re.sub(r"```\s*$", "", cleaned)
        return cleaned.strip()

    def _get_part_context(self, part_number: int) -> str:
        if part_number == 1:
            return "CONTEXT: This is a Part 1 question. Expect a natural, conversational, and relatively short answer (15-30 seconds). Do not strictly penalize for lack of extreme complexity if the answer sounds natural and fully addresses the prompt."
        elif part_number == 2:
            return "CONTEXT: This is a Part 2 monologue. Expect a long, continuous speech (1-2 minutes). Focus heavily on coherence, the ability to speak at length, and how well the candidate links ideas over an extended period."
        elif part_number == 3:
            return "CONTEXT: This is a Part 3 question. Expect a detailed, analytical, and abstract answer. The candidate should demonstrate the ability to justify opinions, analyze situations, and use complex grammatical structures."
        return "CONTEXT: General IELTS Speaking question."

    def grade_single_part(self, audio_path: str, question_text: str, part_number: int):
        logger.info(f"Processing Audio Question for Part {part_number}: {audio_path}")
        gemini_file = None
        
        try:
            if not os.path.exists(audio_path):
                logger.error(f"File not found: {audio_path}")
                return self._return_error_result("Audio file not found on server.")

            file_size = os.path.getsize(audio_path)
            if file_size < 8192:
                logger.warning(f"Audio file is too short or empty: {audio_path}")
                return self._return_error_result("Audio file is too short or empty. Please check your microphone.")

            mime_type, _ = mimetypes.guess_type(audio_path)
            if audio_path.endswith(".webm") or mime_type == "video/webm":
                mime_type = "audio/webm"
            if not mime_type:
                mime_type = "audio/mp3"

            logger.info(f"Uploading to Gemini ({mime_type})...")
            gemini_file = genai.upload_file(audio_path, mime_type=mime_type)
            
            timeout = 60 
            start_time = time.time()

            while gemini_file.state.name == "PROCESSING":
                logger.info("Waiting for audio processing...")
                time.sleep(2)
                gemini_file = genai.get_file(gemini_file.name)
                if time.time() - start_time > timeout:
                    raise TimeoutError("Gemini processing timed out.")

            if gemini_file.state.name == "FAILED":
                raise ValueError(f"Gemini failed to process audio file. State: {gemini_file.state.name}")

            part_context = self._get_part_context(part_number)

            prompt = f"""
            Analyze the user's audio response for a SINGLE QUESTION in **IELTS Speaking Part {part_number}**.
            
            **Question/Topic:** "{question_text}"
            **CRITICAL ANTI-HALLUCINATION RULE (READ FIRST):**
            Listen to the audio carefully. If the audio is completely silent, contains only background static/noise, or has absolutely no intelligible English speech, DO NOT guess, DO NOT hallucinate, and DO NOT transcribe random words. 
            If no speech is detected, you MUST immediately return:
            - "transcript": "[No intelligible speech detected]"
            - All scores: 0.0
            - "feedback": "We could not hear your voice clearly. Please ensure your microphone is working and speak louder."
            - "correction": []
            
            {part_context}

            {self.SPEAKING_RUBRIC}

            Perform the following tasks step-by-step:

            1. **TRANSCRIPTION:** - Write down EXACTLY what the student said verbatim. 
               - MUST include hesitation markers like (uhm, ah, you know) exactly where they occur to assess fluency accurately.

            2. **ERROR ANALYSIS & CORRECTION (CRITICAL FOR UI):**
               You MUST identify errors AND good usages. Categorize the `type` field EXACTLY using one of these keywords:
               - Major Errors: Use `"grammar"`, `"vocabulary"`, or `"pronunciation"` (e.g. dropped ending sounds, wrong stress).
               - Minor Slips: Use `"minor_slip"` or `"spelling"`.
               - Good Usages: If the student uses great idioms or advanced vocabulary, use `"good_phrase"` or `"excellent_vocab"`. (For these, set the `fix` field to "Great usage!").

            3. **GRADING (0.0 - 9.0):**
               - Evaluate based on the 4 criteria provided in the RUBRIC. Use 0.5 increments.
               - Be STRICT. If speech is slow with frequent repetition, Fluency cannot be above 5.0. 
               - If the response is entirely off-topic, heavily penalize Lexical and Fluency scores.
               - If audio is silent or unintelligible, return 0.0.

            4. **FEEDBACK:**
               - Provide constructive, brief feedback specifically for this single answer, focusing on the weakest criterion and praising strengths.

            **OUTPUT FORMAT (JSON ONLY):**
            Respond ONLY with a valid JSON object matching this structure:
            {{
                "transcript": "Full text of the speech including hesitations...",
                "scores": {{
                    "fluency": <float>,
                    "lexical": <float>,
                    "grammar": <float>,
                    "pronunciation": <float>
                }},
                "feedback": "Your overall evaluation...",
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

            logger.info("AI is grading...")
            response = self.model.generate_content([prompt, gemini_file])
            
            clean_json = self._clean_json_string(response.text)
            result = json.loads(clean_json)
            return result

        except Exception as e:
            logger.error(f"Speaking AI Error: {e}", exc_info=True)
            return self._return_error_result(f"AI Error: {str(e)}")
            
        finally:
            if gemini_file:
                try:
                    logger.info(f"Deleting Gemini file: {gemini_file.name}")
                    genai.delete_file(gemini_file.name)
                except Exception as cleanup_error:
                    logger.warning(f"Failed to delete Gemini file {gemini_file.name}: {cleanup_error}")

    def _return_error_result(self, message: str):
        return {
            "transcript": "(Audio processing failed or file was empty)",
            "scores": {
                "fluency": 0.0,
                "lexical": 0.0,
                "grammar": 0.0,
                "pronunciation": 0.0
            },
            "feedback": message,
            "correction": []
        }