from sqlalchemy.orm import Session, joinedload
from fastapi import UploadFile, HTTPException
import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional
import json 

# Import Database & AI
from app.core.database import SessionLocal 
from app.core.AI.writing_grading import IELTS_Writing_Grader 
from app.modules.IELTS.writing.models import WritingTest, WritingTask, WritingSubmission, WritingStatus, WritingTaskType
from app.modules.IELTS.writing import schemas

# Import Subscription Service
from app.modules.subscriptions.service import SubscriptionService

# Cấu hình Domain
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

class WritingService:
    
    # ==================== 1. UTILS ====================
    @staticmethod
    def count_words(text: str) -> int:
        if not text: return 0
        return len(text.strip().split())

    @staticmethod
    def upload_image(file: UploadFile) -> str:
        """Lưu ảnh đề bài Task 1"""
        UPLOAD_DIR = "static/writing_images"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        ext = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            print(f"Error saving image: {e}")
            return ""
            
        return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    @staticmethod
    def round_ielts_score(score: float) -> float:
        """Quy tắc làm tròn IELTS: 0.25->0.5; 0.75->1.0"""
        if score is None: return 0.0
        decimal = score - int(score)
        if decimal < 0.25: return float(int(score))
        if decimal < 0.75: return int(score) + 0.5
        return int(score) + 1.0


    # ==================== 2. ADMIN: TEST CRUD ====================
    
    @staticmethod
    def create_test(db: Session, test_in: schemas.WritingTestCreate):
        db_test = WritingTest(
            title=test_in.title, 
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
        
        for t in test_in.tasks:
            db_task = WritingTask(
                test_id=db_test.id,
                task_type=t.task_type,
                question_text=t.question_text,
                image_url=t.image_url,
            )
            db.add(db_task)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.WritingTestUpdate):
        test = db.query(WritingTest).filter(WritingTest.id == test_id).first()
        if not test: return None
        
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.tasks is not None:
            db.query(WritingTask).filter(WritingTask.test_id == test_id).delete()
            for t in test_in.tasks:
                db_task = WritingTask(
                    test_id=test.id,
                    task_type=t.task_type,
                    question_text=t.question_text,
                    image_url=t.image_url,
                )
                db.add(db_task)

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(WritingTest).filter(WritingTest.id == test_id).first()
        if not test: return False
        
        # Nhờ cấu hình ondelete="CASCADE" trong models.py, ta chỉ cần xóa Test
        try:
            db.delete(test)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(WritingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(WritingTest.is_full_test_only == True)
            tests = query.order_by(WritingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.WritingTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                WritingTest.is_published == True,
                WritingTest.is_full_test_only == False
            )
            tests = query.order_by(WritingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(WritingSubmission).filter(
                        WritingSubmission.test_id == test.id,
                        WritingSubmission.user_id == current_user_id,
                        WritingSubmission.is_full_test_only == False
                    ).order_by(WritingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = schemas.WritingTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        return db.query(WritingTest).options(joinedload(WritingTest.tasks)).filter(WritingTest.id == test_id).first()


    # ==================== 3. USER: SUBMIT & AI PROCESSING ====================
    
    @staticmethod
    def create_submission(db: Session, user_id: int, sub_in: schemas.SubmitWriting):
        if not sub_in.is_full_test_only:
            SubscriptionService.check_and_increment_quota(db, user_id, "WRITING")

        sub = WritingSubmission(
            user_id=user_id,
            test_id=sub_in.test_id,
            task1_content=sub_in.task1_content,
            task2_content=sub_in.task2_content,
            task1_word_count=WritingService.count_words(sub_in.task1_content),
            task2_word_count=WritingService.count_words(sub_in.task2_content),
            status=WritingStatus.PENDING,
            is_full_test_only=sub_in.is_full_test_only,
            submitted_at=datetime.now()
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        
        return sub

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
                sub.score_t1_overall = WritingService.round_ielts_score(raw_t1)
                
                sub.feedback_t1 = t1.get('feedback', '')
                sub.correction_t1 = t1.get('correction', []) 

                # --- MAP TASK 2 ---
                t2 = ai_res.get('task2', {})
                sub.score_t2_tr = t2.get('tr', 0) 
                sub.score_t2_cc = t2.get('cc', 0)
                sub.score_t2_lr = t2.get('lr', 0)
                sub.score_t2_gra = t2.get('gra', 0)
                
                raw_t2 = (sub.score_t2_tr + sub.score_t2_cc + sub.score_t2_lr + sub.score_t2_gra) / 4
                sub.score_t2_overall = WritingService.round_ielts_score(raw_t2)
                
                sub.feedback_t2 = t2.get('feedback', '')
                sub.correction_t2 = t2.get('correction', [])

                # --- TỔNG KẾT ---
                final_raw = 0.0
                if sub.score_t1_overall > 0 and sub.score_t2_overall > 0:
                    # IELTS Cách tính điểm Writing: (Task 1 + Task 2 * 2) / 3
                    final_raw = (sub.score_t1_overall + (sub.score_t2_overall * 2)) / 3
                elif sub.score_t1_overall > 0:
                    final_raw = sub.score_t1_overall
                elif sub.score_t2_overall > 0:
                    final_raw = sub.score_t2_overall

                sub.band_score = WritingService.round_ielts_score(final_raw)
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

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(WritingSubmission).options(joinedload(WritingSubmission.test))\
                 .filter(WritingSubmission.user_id == user_id, WritingSubmission.is_full_test_only == False)\
                 .order_by(WritingSubmission.submitted_at.desc())\
                 .all()
    
    @staticmethod
    def get_submission_detail(db: Session, sub_id: int):
        return db.query(WritingSubmission)\
                 .options(
                     joinedload(WritingSubmission.test).joinedload(WritingTest.tasks)
                 )\
                 .filter(WritingSubmission.id == sub_id)\
                 .first()


    # =======================================================
    # 👑 ADMIN: SUBMISSION MANAGEMENT
    # =======================================================
    
    @staticmethod
    def get_all_submissions_for_admin(
        db: Session, 
        skip: int = 0, 
        limit: int = 10, 
        status_filter: Optional[str] = None
    ):
        """Lấy danh sách bài nộp có phân trang, trả về chuẩn dict {items, total}"""
        query = db.query(WritingSubmission).options(
            joinedload(WritingSubmission.user),
            joinedload(WritingSubmission.test)
        ).filter(WritingSubmission.is_full_test_only == False)
        
        if status_filter:
            query = query.filter(WritingSubmission.status == status_filter)
            
        total = query.count()
        items = query.order_by(WritingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "items": [schemas.AdminWritingSubmissionResponse.model_validate(i) for i in items]
        }

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        """Xem lịch sử làm bài Writing của một học viên cụ thể"""
        return db.query(WritingSubmission).options(
            joinedload(WritingSubmission.user),
            joinedload(WritingSubmission.test)
        ).filter(
            WritingSubmission.user_id == target_user_id
        ).order_by(WritingSubmission.submitted_at.desc()).all()