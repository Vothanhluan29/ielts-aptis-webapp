from sqlalchemy.orm import Session
from app.modules.APTIS.exam.models import AptisExamSubmission, AptisExamStatus

class AptisExamUtils:
    @staticmethod
    def calculate_aptis_cefr(total_score: int) -> str:
        if total_score >= 210: return "C"
        if total_score >= 170: return "B2"
        if total_score >= 120: return "B1"
        if total_score >= 70:  return "A2"
        if total_score >= 30:  return "A1"
        return "A0"

    @staticmethod
    def recalculate_overall_score(db: Session, sub: AptisExamSubmission, auto_commit: bool = True):

        
        gv = sub.grammar_vocab_submission.total_score if sub.grammar_vocab_submission and sub.grammar_vocab_submission.total_score is not None else 0
        l  = sub.listening_submission.score if sub.listening_submission and sub.listening_submission.score is not None else 0
        r  = sub.reading_submission.score if sub.reading_submission and sub.reading_submission.score is not None else 0
        
        w = None
        if sub.writing_submission and sub.writing_submission.status == 'GRADED':
            w = sub.writing_submission.score or 0
            
        s = None
        if sub.speaking_submission and sub.speaking_submission.status == 'GRADED':
            s = sub.speaking_submission.total_score or 0
        sub.grammar_vocab_score = gv
        sub.listening_score = l
        sub.reading_score = r
        sub.writing_score = w
        sub.speaking_score = s

        current_overall = gv + l + r + (w or 0) + (s or 0)

        is_fully_graded = True
        if sub.writing_submission and sub.writing_submission.status != 'GRADED':
            is_fully_graded = False
        if sub.speaking_submission and sub.speaking_submission.status != 'GRADED':
            is_fully_graded = False


        if sub.status == AptisExamStatus.PENDING.value and is_fully_graded:
            sub.status = AptisExamStatus.COMPLETED.value


        if sub.status == AptisExamStatus.COMPLETED.value:
            final_cefr = AptisExamUtils.calculate_aptis_cefr(current_overall)
            if sub.overall_score != current_overall or sub.overall_cefr_level != final_cefr:
                sub.overall_score = current_overall
                sub.overall_cefr_level = final_cefr
                if auto_commit:
                    db.commit()
                    
        elif sub.status == AptisExamStatus.PENDING.value:
            if sub.overall_score != current_overall or sub.overall_cefr_level is not None:
                sub.overall_score = current_overall
                sub.overall_cefr_level = None 
                if auto_commit:
                    db.commit()
            
        return current_overall