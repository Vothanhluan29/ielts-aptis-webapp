class AptisReadingUtils:
    @staticmethod
    def calculate_aptis_score_and_cefr(correct_count: int, total_questions: int = 25) -> dict:
        if total_questions > 0:
            scale_score = round((correct_count / total_questions) * 50)
            scale_score = min(50, scale_score)  # Ensure score is between 0 and 50
        else:
            scale_score = 0

        cefr = "A0"
        if correct_count >= 46:    cefr = "C"
        elif correct_count >= 38:  cefr = "B2"
        elif correct_count >= 28:  cefr = "B1"
        elif correct_count >= 19:   cefr = "A2"
        elif correct_count >= 1:   cefr = "A1"
            
        return {
            "score": scale_score,
            "cefr_level": cefr
        }

    @staticmethod
    def clean_text(text) -> str:
        if text is None: return ""
        return " ".join(str(text).strip().lower().split())