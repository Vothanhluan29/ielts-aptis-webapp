class ReadingUtils:
    @staticmethod
    def calculate_ielts_band(correct_count: int) -> float:
        """ IELTS Academic Reading Band Score Calculation based on the number of correct answers."""
        if correct_count >= 39: return 9.0
        if correct_count >= 37: return 8.5
        if correct_count >= 35: return 8.0
        if correct_count >= 33: return 7.5
        if correct_count >= 30: return 7.0
        if correct_count >= 27: return 6.5
        if correct_count >= 23: return 6.0
        if correct_count >= 19: return 5.5
        if correct_count >= 15: return 5.0
        if correct_count >= 13: return 4.5
        if correct_count >= 10: return 4.0
        return 0.0

    @staticmethod
    def clean_text(text) -> str:
        if text is None: return ""
        return " ".join(str(text).strip().lower().split())

    @staticmethod
    def check_is_correct(user_ans, correct_answers: list) -> bool:
        if user_ans is None or user_ans == "" or user_ans == []:
            return False
        if not correct_answers:
            return False
            
        accepted_cleaned = [ReadingUtils.clean_text(ans) for ans in correct_answers]
        

        if isinstance(user_ans, list):
            user_cleaned = [ReadingUtils.clean_text(a) for a in user_ans]
            return set(user_cleaned) == set(accepted_cleaned)
            
        cleaned_student = ReadingUtils.clean_text(user_ans)
        return cleaned_student in accepted_cleaned