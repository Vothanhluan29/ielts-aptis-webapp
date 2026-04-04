from sqlalchemy.orm import joinedload
from datetime import datetime

from app.core.database import SessionLocal 
from app.core.AI.writing_grading import IELTS_Writing_Grader 
from app.modules.IELTS.writing.models import WritingTest, WritingSubmission, WritingStatus, WritingTaskType
from .utils import WritingUtils

class WritingGradingService:
    @staticmethod
    def process_ai_grading(submission_id: int):
        print(f"[AI START] Grading Writing Submission #{submission_id}...")
        db = SessionLocal()
        try:
            sub = db.query(WritingSubmission).filter(WritingSubmission.id == submission_id).first()
            if not sub: return

            sub.status = WritingStatus.GRADING
            db.commit()

            test = db.query(WritingTest).options(joinedload(WritingTest.tasks)).filter(WritingTest.id == sub.test_id).first()
            q1, q2 = "No question", "No question"
            task1_img = None 
            
            if test and test.tasks:
                for t in test.tasks:
                    if t.task_type == WritingTaskType.TASK_1: 
                        q1 = t.question_text
                        task1_img = t.image_url
                    if t.task_type == WritingTaskType.TASK_2: 
                        q2 = t.question_text
            
            grader = IELTS_Writing_Grader()
            
            ai_res = grader.grade_writing(
                task1_question=q1, 
                task1_answer=sub.task1_content, 
                task2_question=q2, 
                task2_answer=sub.task2_content,
                task1_image_url=task1_img
            )

            if ai_res:
                # --- MAP TASK 1 ---
                t1 = ai_res.get('task1', {})
                sub.score_t1_ta = t1.get('ta', 0)
                sub.score_t1_cc = t1.get('cc', 0)
                sub.score_t1_lr = t1.get('lr', 0)
                sub.score_t1_gra = t1.get('gra', 0)
                
                raw_t1 = (sub.score_t1_ta + sub.score_t1_cc + sub.score_t1_lr + sub.score_t1_gra) / 4
                sub.score_t1_overall = WritingUtils.round_ielts_score(raw_t1)
                
                sub.feedback_t1 = t1.get('feedback', '')
                sub.correction_t1 = t1.get('correction', []) 

                # --- MAP TASK 2 ---
                t2 = ai_res.get('task2', {})
                sub.score_t2_tr = t2.get('tr', 0) 
                sub.score_t2_cc = t2.get('cc', 0)
                sub.score_t2_lr = t2.get('lr', 0)
                sub.score_t2_gra = t2.get('gra', 0)
                
                raw_t2 = (sub.score_t2_tr + sub.score_t2_cc + sub.score_t2_lr + sub.score_t2_gra) / 4
                sub.score_t2_overall = WritingUtils.round_ielts_score(raw_t2)
                
                sub.feedback_t2 = t2.get('feedback', '')
                sub.correction_t2 = t2.get('correction', [])

                # --- TỔNG KẾT ---
                final_raw = 0.0
                if sub.score_t1_overall > 0 and sub.score_t2_overall > 0:
                    final_raw = (sub.score_t1_overall + (sub.score_t2_overall * 2)) / 3
                elif sub.score_t1_overall > 0:
                    final_raw = sub.score_t1_overall
                elif sub.score_t2_overall > 0:
                    final_raw = sub.score_t2_overall

                sub.band_score = WritingUtils.round_ielts_score(final_raw)
                sub.overall_feedback = ai_res.get('general_feedback', '')
                
                sub.status = WritingStatus.GRADED
                sub.graded_at = datetime.now()
            
            else:
                 sub.status = WritingStatus.ERROR
                 sub.overall_feedback = "AI failed to return valid results."

            db.commit()
            print(f" [AI DONE] Graded Sub #{submission_id}. Band: {sub.band_score}")
            
        except Exception as e:
            print(f"[AI ERROR] Writing Grading: {e}")
            try:
                sub.status = WritingStatus.ERROR
                sub.overall_feedback = "System Error during grading."
                db.commit()
            except:
                db.rollback()
        finally:
            db.close()