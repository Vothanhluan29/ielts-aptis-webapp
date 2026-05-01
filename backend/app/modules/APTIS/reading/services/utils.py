class AptisReadingUtils:
    @staticmethod
    def calculate_aptis_score_and_cefr(correct_count: int, total_questions: int = 29) -> dict:
        if total_questions > 0:
            scale_score = round((correct_count / total_questions) * 50)
        else:
            scale_score = 0

        cefr = "A0"
        if correct_count >= 27:    cefr = "C"
        elif correct_count >= 23:  cefr = "B2"
        elif correct_count >= 18:  cefr = "B1"
        elif correct_count >= 12:  cefr = "A2"
        elif correct_count >= 6:   cefr = "A1"
            
        return {
            "score": scale_score,
            "cefr_level": cefr
        }
    @staticmethod
    def clean_text(text) -> str:
        if text is None: 
            return ""
        return " ".join(str(text).strip().lower().split())