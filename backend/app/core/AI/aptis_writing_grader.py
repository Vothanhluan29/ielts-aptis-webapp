import google.generativeai as genai # type: ignore
import json
import re
import httpx # type: ignore
from app.core.config import settings

# Cấu hình API Key
genai.configure(api_key=settings.GEMINI_API_KEY)

class Aptis_Writing_Grader:
    def __init__(self):
        generation_config = {
            "temperature": 0.1, # Hạ Temperature xuống 0.1 để AI cực kỳ lạnh lùng và logic
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "application/json", 
        }
        
        # System Instruction: Bơm thêm sự "khó tính" (Nitpicky, Unforgiving)
        self.model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash", # Khuyên dùng bản Flash thường cho tư duy sâu
            generation_config=generation_config,
            system_instruction="""You are an extremely strict, nitpicky, and unforgiving British Council Aptis Writing Examiner. 
            You do NOT inflate scores. You actively look for minor errors (articles, plurals, prepositions, punctuation) to penalize.
            A response with basic vocabulary and simple sentences, even if error-free, CANNOT score higher than B1.
            Provide brutal but constructive corrections and suggest high-end C1/C2 vocabulary alternatives."""
        )

        # --- APTIS RUBRIC CỰC KỲ KHẮT KHE ---
        self.APTIS_RUBRIC = """
        OFFICIAL APTIS WRITING EVALUATION CRITERIA & PENALTY SYSTEM:
        
        [STRICT PENALTIES - APPLY THESE MERCILESSLY]:
        1. WORD COUNT: If an answer is under the required word limit (e.g., Part 3 < 30 words, Part 4 Formal < 120 words), DEDUCT 20% of the part_score immediately.
        2. GRAMMAR & SPELLING: Deduct points for EVERY minor slip (missing 'a/an/the', wrong subject-verb agreement, typos). Do not ignore any error.
        3. VOCABULARY CEILING: If a student uses only basic A1/A2 words (e.g., 'good', 'bad', 'happy', 'sad', 'buy') and simple sentences (S+V+O), their total score MUST NOT EXCEED 25/50 (Max B1), even if grammar is 100% perfect. To get B2/C (26-50), they MUST use complex structures (relative clauses, conditionals, passive voice) and idiomatic/advanced vocabulary.
        4. REGISTER/TONE DISASTER: In Part 4, if the Formal Email contains contractions (I'm, don't), casual greetings (Hi, Hello), or emotional/informal slang, the score for the Formal Email MUST BE HALVED (Maximum 7/15).
        
        [PART EXPECTATIONS]:
        - PART 1 (5 pts): 1-5 words. Deduct 1 point for ANY spelling error.
        - PART 2 (7 pts): 20-30 words. Must be full sentences.
        - PART 3 (15 pts): 30-40 words each. Must directly address all 3 questions naturally.
        - PART 4 (23 pts total): Informal (8 pts) - MUST be friendly. Formal (15 pts) - MUST be strictly professional and objective.
        """

    def _clean_json_string(self, json_str: str) -> str:
        if not json_str: return "{}"
        cleaned = re.sub(r"```json\s*", "", json_str)
        cleaned = re.sub(r"```\s*$", "", cleaned)
        return cleaned.strip()

    def grade_writing(self, questions_payload: list, user_answers: dict) -> dict:
        q_str = json.dumps(questions_payload, ensure_ascii=False, indent=2)
        a_str = json.dumps(user_answers, ensure_ascii=False, indent=2)

        text_prompt = f"""
        You are grading an Aptis Writing Test. Be ruthless. Do not praise basic English.

        {self.APTIS_RUBRIC}

        --- INPUT DATA ---
        [TEST QUESTIONS]: 
        {q_str}

        [STUDENT ANSWERS]: 
        {a_str}

        --- GRADING INSTRUCTIONS ---
        1. Read the Student Answers. Count the words mentally. Apply the [WORD COUNT] penalty if they are too short.
        2. Hunt for grammatical errors (articles, prepositions, tenses). Log EVERY error in the "corrections" array.
        3. Evaluate the Vocabulary. Is it basic? If yes, cap the total score at B1 level (<= 25).
        4. Scrutinize the Tone in Part 4. Apply the [REGISTER/TONE DISASTER] penalty if the formal email sounds like a text message.
        5. For sentences that are grammatically correct but use basic vocabulary (e.g., "I think it is bad"), provide a "better_suggestion" to elevate it to C1 level (e.g., "I firmly believe this is detrimental").

        --- OUTPUT FORMAT (STRICT JSON ONLY) ---
            You MUST return a valid JSON matching EXACTLY this structure.
            CRITICAL MATHEMATICS RULE: The "score" value MUST be the EXACT sum of all 5 "part_score" values below it. Do not miscalculate.
        {{
            "score": <int 0-50>,
            "cefr_level": "<A1, A2, B1, B2, or C>",
            "overall_feedback": "<Brutally honest comment on their grammar, vocabulary ceiling, and tone issues>",
            "ai_feedback": {{
                "PART_1": {{
                    "part_score": <int out of 5>,
                    "general_comment": "<brief strict comment>",
                    "corrections": [
                        {{
                            "original_sentence": "<text>",
                            "corrected_sentence": "<text>",
                            "error_type": "<grammar/spelling>",
                            "better_suggestion": null
                        }}
                    ]
                }},
                "PART_2": {{
                    "part_score": <int out of 7>,
                    "general_comment": "<brief strict comment>",
                    "corrections": [] 
                }},
                "PART_3": {{
                    "part_score": <int out of 15>,
                    "general_comment": "<brief strict comment>",
                    "corrections": []
                }},
                "PART_4": {{
                    "informal_email": {{
                        "part_score": <int out of 8>,
                        "general_comment": "<comment on informal tone>",
                        "corrections": []
                    }},
                    "formal_email": {{
                        "part_score": <int out of 15>,
                        "general_comment": "<comment on formal tone, checking for contractions and casual words>",
                        "corrections": [
                            {{
                                "original_sentence": "<basic or informal sentence>",
                                "corrected_sentence": "<grammatically fixed sentence>",
                                "error_type": "Tone / Vocabulary / Grammar",
                                "better_suggestion": {{
                                    "advanced_version": "<C1 level formal sentence>",
                                    "explanation": "<Why is this better?>"
                                }}
                            }}
                        ]
                    }}
                }}
            }}
        }}
        """

        try:
            print("[AI] Sending STRICT Aptis Writing request to Gemini...")
            response = self.model.generate_content([text_prompt])
            
            raw_text = response.text
            clean_text = self._clean_json_string(raw_text)
            result = json.loads(clean_text)
            
            return result
            
        except Exception as e:
            print(f"Aptis AI Grading Error: {e}")
            return {
                "score": 0,
                "cefr_level": "A0",
                "overall_feedback": "System error during AI grading. Please ask the teacher to grade manually.",
                "ai_feedback": {}
            }