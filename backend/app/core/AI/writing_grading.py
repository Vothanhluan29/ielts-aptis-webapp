import google.generativeai as genai #type: ignore
import json
import re
import httpx #type: ignore
import logging
from app.core.config import settings

# Cấu hình Logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Cấu hình API Key
genai.configure(api_key=settings.GEMINI_API_KEY)

class IELTS_Writing_Grader:
    def __init__(self):
        generation_config = {
            "temperature": 0.1, # Giữ temperature thấp để AI tập trung bắt lỗi chính xác
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "application/json",
        }
        
        self.model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash-lite", 
            generation_config=generation_config,
            system_instruction="""You are an extremely strict, senior IELTS Examiner. 
            Your job is to grade Writing tasks accurately based on the official Band Descriptors.
            You are known for being harsh but highly accurate. DO NOT inflate scores. 
            Your primary goal is to meticulously identify ALL grammatical, lexical, punctuation, and structural errors in the candidate's essay and provide exact corrections.
            For Task 1, you MUST cross-reference the essay with the provided chart/diagram image to ensure data accuracy. Penalize severely for reporting inaccurate data or missing the main overview."""
        )

        # --- TASK 1 RUBRIC ---
        self.TASK_1_RUBRIC = """
        OFFICIAL IELTS TASK 1 BAND DESCRIPTORS (Task Achievement - TA):
        - Band 9: Fully satisfies all requirements; clearly presents a fully developed response.
        - Band 8: Covers all requirements sufficiently; presents, highlights, and illustrates key features clearly.
        - Band 7: Covers requirements; presents a CLEAR OVERVIEW of main trends, differences, or stages.
        - Band 6: Addresses requirements; presents an overview with information appropriately selected; details may be irrelevant or inaccurate.
        - Band 5: Generally addresses the task; recounts detail mechanically with NO CLEAR OVERVIEW; no data to support the description.
        - Band 4: Attempts to address task but does not cover all key features; confuses key features with detail.
        """

        # --- TASK 2 RUBRIC ---
        self.TASK_2_RUBRIC = """
        OFFICIAL IELTS TASK 2 BAND DESCRIPTORS (Apply STRICTLY):

        1. TASK RESPONSE (TR):
           - Band 9: Fully addresses all parts of the task; presents a fully developed position with relevant, fully extended and well-supported ideas.
           - Band 8: Sufficiently addresses all parts of the task; presents a well-developed response with relevant, extended and supported ideas.
           - Band 7: Addresses all parts of the task; presents a CLEAR POSITION THROUGHOUT the response.
           - Band 6: Addresses all parts of the task (some more fully than others); presents a relevant position but conclusions may be unclear/repetitive.
           - Band 5: Addresses the task only partially; expresses a position but development is not always clear; irrelevant detail.
           - Band 4: Responds tangentially; position is unclear; ideas are difficult to identify or repetitive.

        2. COHERENCE AND COHESION (CC):
           - Band 7: Logically organises information; clear progression throughout; presents a clear central topic within each paragraph.
           - Band 6: Arranges information coherently; uses cohesive devices effectively but may be faulty/mechanical.
           - Band 5: Presents information with some organisation but lack of overall progression; inadequate/inaccurate use of cohesive devices.

        3. LEXICAL RESOURCE (LR):
           - Band 7: Sufficient range to allow flexibility and precision; uses less common lexical items with some awareness of style/collocation.
           - Band 6: Adequate range for the task; attempts less common vocabulary with some inaccuracy.
           - Band 5: Limited range of vocabulary; noticeable errors in spelling/word formation that may cause difficulty for the reader.

        4. GRAMMATICAL RANGE AND ACCURACY (GRA):
           - Band 7: Variety of complex structures; frequent error-free sentences; good control of grammar/punctuation.
           - Band 6: Mix of simple and complex sentence forms; makes some errors in grammar/punctuation but they rarely reduce communication.
           - Band 5: Limited range of structures; frequent grammatical errors causing some difficulty for the reader.
        """

    def _clean_json_string(self, json_str: str) -> str:
        if not json_str: return "{}"
        cleaned = re.sub(r"```json\s*", "", json_str)
        cleaned = re.sub(r"```\s*$", "", cleaned)
        return cleaned.strip()

    def _load_image_from_url(self, url: str):
        try:
            if not url or not url.startswith("http"): return None
            response = httpx.get(url, timeout=10.0)
            response.raise_for_status()
            return {
                "mime_type": response.headers.get("content-type", "image/jpeg"),
                "data": response.content
            }
        except Exception as e:
            logger.error("Error loading image from URL: %s", e)
            return None

    def grade_writing(self, task1_question, task1_answer, task2_question, task2_answer, task1_image_url=None):
        
        has_t1 = task1_answer and len(task1_answer.strip()) > 10
        has_t2 = task2_answer and len(task2_answer.strip()) > 10

        if not has_t1 and not has_t2: 
            return None 

        t1_text = task1_answer if has_t1 else "CANDIDATE DID NOT ATTEMPT THIS TASK."
        t2_text = task2_answer if has_t2 else "CANDIDATE DID NOT ATTEMPT THIS TASK."

        # Tải ảnh Task 1 nếu có
        task1_image_data = self._load_image_from_url(task1_image_url) if task1_image_url else None
        
        # Xây dựng Prompt
        text_prompt = f"""
        You are grading an IELTS Writing Test. Use the provided RUBRICS strictly. Do not give the benefit of the doubt.

        {self.TASK_1_RUBRIC}
        
        {self.TASK_2_RUBRIC}

        --- INPUT DATA ---
        [TASK 1 IMAGE]: {'Provided in the request' if task1_image_data else 'Not provided'}
        [TASK 1 QUESTION]: {task1_question}
        [TASK 1 ESSAY]: {t1_text}

        [TASK 2 QUESTION]: {task2_question}
        [TASK 2 ESSAY]: {t2_text}

        --- GRADING INSTRUCTIONS ---
        1. **Task 1 (Task Achievement):**
           - **Overview:** If there is no clear overview, limit TA to Band 5.
           - **Data Accuracy:** Compare the essay with the provided image (if any). If the candidate misreads data, penalize TA heavily.
           
        2. **Task 2 (Task Response):**
           - **Position:** Is the candidate's opinion clear *throughout*? Missing a clear position drops TR to Band 6 or 5.
           - **All Parts:** Does the essay address ALL parts of the prompt? Missing a part limits TR to Band 6 maximum.

        3. **Scoring:** Use increments of 0.5 (e.g., 5.5, 6.0, 6.5). Be strict and objective.

        4. **EXHAUSTIVE ERROR CORRECTION (CRITICAL & HIGHLY SPECIFIC):**
           - You MUST extract and correct EVERY error in the essays (Grammar, Vocabulary, Spelling, Punctuation, Awkward Phrasing).
           - "text": Extract ONLY the exact incorrect word or short phrase (MAXIMUM 1-4 words). DO NOT extract the entire sentence or clause.
           - "fix": Provide the exact correction for those specific words.
           - Classify the "type" strictly as one of: grammar, vocabulary, spelling, punctuation, coherence.
           - "explanation": Provide a short, friendly explanation.
           - *Example:* If candidate writes "Many peoples believes that...", extract "peoples believes" (NOT the whole sentence) and fix as "people believe".

        --- OUTPUT FORMAT (JSON ONLY) ---
        Respond ONLY with a valid JSON object matching this structure:

        {{
            "task1": {{
                "ta": <float>, "cc": <float>, "lr": <float>, "gra": <float>,
                "feedback": "<Specific feedback citing the Band Descriptor level achieved>",
                "correction": [
                    {{
                        "text": "<incorrect word/short phrase>",
                        "fix": "<corrected word/short phrase>",
                        "type": "grammar",
                        "explanation": "<why it is wrong>"
                    }}
                ]
            }},
            "task2": {{
                "tr": <float>, "cc": <float>, "lr": <float>, "gra": <float>,
                "feedback": "<Specific feedback based on Task 2 Rubric. Mention Position clarity and Idea development>",
                "correction": [
                     {{
                        "text": "<incorrect word/short phrase>",
                        "fix": "<corrected word/short phrase>",
                        "type": "vocabulary",
                        "explanation": "<why it is wrong>"
                    }}
                ]
            }},
            "general_feedback": "<Overall summary and specific, strict advice to improve>"
        }}
        """

        # Tạo payload gửi Gemini
        request_content = [text_prompt]
        if task1_image_data:
            request_content.append(task1_image_data)

        try:
            logger.info("Sending request to Gemini for Writing Grading...")
            response = self.model.generate_content(request_content)
            
            raw_text = response.text
            clean_text = self._clean_json_string(raw_text)
            result = json.loads(clean_text)
            
            logger.info("Successfully received and parsed grading result from Gemini.")
            return result
            
        except Exception as e:
            logger.error("System error during AI grading: %s", e)
            # Trả về default error để không crash app
            return {
                "task1": {"ta": 0, "cc": 0, "lr": 0, "gra": 0, "feedback": "AI Grading Error", "correction": []},
                "task2": {"tr": 0, "cc": 0, "lr": 0, "gra": 0, "feedback": "AI Grading Error", "correction": []},
                "general_feedback": "System error during grading. Please contact administrator."
            }