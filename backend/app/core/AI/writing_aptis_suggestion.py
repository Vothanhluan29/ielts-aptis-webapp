import google.generativeai as genai #type: ignore
import json
import re
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

genai.configure(api_key=settings.GEMINI_API_KEY)

class WritingAptisSuggestion:
    def __init__(self):
        generation_config = {
            "temperature": 0.7, 
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
            "response_mime_type": "application/json",
        }
        
        self.model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash-lite", 
            generation_config=generation_config,
            system_instruction="""You are an expert native English teacher (C2 level). 
            Your job is to provide specific, highly accurate suggestions to improve sentences written by ESL students.
            You should correct grammar and vocabulary, and offer both a natural version and an advanced version of the sentence.
            You must reply in valid JSON format."""
        )

    def _clean_json_string(self, json_str: str) -> str:
        if not json_str: return "{}"
        cleaned = re.sub(r"```json\s*", "", json_str)
        cleaned = re.sub(r"```\s*$", "", cleaned)
        return cleaned.strip()

    def get_suggestion(self, text: str, part_context: str = None):
        if not text or len(text.strip()) < 2:
            return {"suggestions": []}

        context_instruction = ""
        if part_context:
            context_instruction = f"""
        Context: The student is writing for {part_context} of the Aptis Writing exam. 
        Please tailor your suggestions to fit the requirements of this part:
        - If it's Part 1 (Word-level), keep it extremely brief (1-5 words).
        - If it's Part 2 (Short text), keep it around 20-30 words.
        - If it's Part 3 (Social network), keep it around 30-40 words, conversational tone.
        - If it's Part 4 (Informal), keep it around 40-50 words, friendly tone.
        - If it's Part 4 (Formal), keep it around 120-150 words, polite and formal tone.
        Make sure the rewritten versions strictly respect these length and tone constraints.
        """

        prompt = f"""
        Analyze the following text written by an ESL student:
        "{text}"
        {context_instruction}
        Provide 2 rewritten versions:
        1. A "Natural" version: Fix all grammar errors and make it sound natural for everyday use while respecting the context rules.
        2. An "Advanced" version: Elevate the vocabulary to C1/C2 level while respecting the context rules.

        Respond ONLY with a valid JSON object matching this structure:
        {{
            "suggestions": [
                {{
                    "type": "Natural",
                    "rewritten_text": "<the natural version>",
                    "explanation": "<brief explanation of the changes made>"
                }},
                {{
                    "type": "Advanced",
                    "rewritten_text": "<the advanced version>",
                    "explanation": "<brief explanation of the changes made>"
                }}
            ]
        }}
        """

        try:
            logger.info("Sending request to Gemini for writing suggestion...")
            response = self.model.generate_content([prompt])
            
            raw_text = response.text
            clean_text = self._clean_json_string(raw_text)
            result = json.loads(clean_text)
            
            logger.info("Successfully received suggestion from Gemini.")
            return result
            
        except Exception as e:
            logger.error("System error during AI suggestion: %s", e)
            return {
                "suggestions": [
                    {
                        "type": "Error",
                        "rewritten_text": "Failed to generate suggestion.",
                        "explanation": "An error occurred while contacting the AI service."
                    }
                ]
            }

suggestion_service = WritingAptisSuggestion()
