class AptisReadingUtils:
    @staticmethod
    def calculate_aptis_score_and_cefr(correct_count: int, total_questions: int = 29) -> dict:
        if total_questions > 0:
            scale_score = round((correct_count / total_questions) * 50)
        else:
            scale_score = 0

        cefr = "A0"
        if scale_score >= 46:      cefr = "C"   # Từ 46 - 50 điểm
        elif scale_score >= 38:    cefr = "B2"  # Từ 38 - 45 điểm
        elif scale_score >= 26:    cefr = "B1"  # Từ 26 - 37  điểm
        elif scale_score >= 16:    cefr = "A2"  # Từ 16 - 25 điểm
        elif scale_score >= 8:     cefr = "A1"  # Từ 8 - 15 điểm
            
        return {
            "score": scale_score,
            "cefr_level": cefr
        }
    @staticmethod
    def clean_text(text) -> str:
        if text is None: 
            return ""
        return " ".join(str(text).strip().lower().split())