class AptisReadingUtils:
    @staticmethod
    def calculate_aptis_score_and_cefr(user_points: float, max_points: int) -> dict:
        if max_points > 0:
            scale_score = round((user_points / max_points) * 50)
        else:
            scale_score = 0

        scale_score = min(scale_score, 50)
        cefr = "A0"
        if scale_score >= 46:      
            cefr = "C"
        elif scale_score >= 40:    
            cefr = "B2"
        elif scale_score >= 30:    
            cefr = "B1"
        elif scale_score >= 20:    
            cefr = "A2"
        elif scale_score >= 10:    
            cefr = "A1"
            
        return {
            "score": scale_score,
            "cefr_level": cefr
        }

    @staticmethod
    def clean_text(text) -> str:
        if text is None: 
            return ""
        return " ".join(str(text).strip().lower().split())