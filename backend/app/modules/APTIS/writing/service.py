from sqlalchemy.orm import Session, joinedload
from fastapi import UploadFile, HTTPException
import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import json 

# 🔥 Đã xóa hoàn toàn import AI (Aptis_Writing_Grader)
from app.core.database import SessionLocal 

from app.modules.APTIS.writing.models import (
    AptisWritingTest, AptisWritingPart, AptisWritingQuestion, 
    AptisWritingSubmission, AptisWritingStatus, AptisWritingPartType
)
from app.modules.APTIS.writing import schemas

# Cấu hình Domain
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

class AptisWritingService:
    
    # ==================== 1. UTILS ====================
    
    @staticmethod
    def count_words(text: str) -> int:
        if not text: return 0
        return len(text.strip().split())

    @staticmethod
    def count_words_json(data: Any) -> int:
        count = 0
        if isinstance(data, str):
            count += AptisWritingService.count_words(data)
        elif isinstance(data, list):
            for item in data:
                count += AptisWritingService.count_words_json(item)
        elif isinstance(data, dict):
            for value in data.values():
                count += AptisWritingService.count_words_json(value)
        return count

    # @staticmethod
    # def upload_image(file: UploadFile) -> str:
    #     UPLOAD_DIR = "static/aptis_writing_images" 
    #     os.makedirs(UPLOAD_DIR, exist_ok=True)
        
    #     ext = file.filename.split('.')[-1]
    #     filename = f"{uuid.uuid4()}.{ext}"
    #     file_path = os.path.join(UPLOAD_DIR, filename)
        
    #     try:
    #         with open(file_path, "wb") as buffer:
    #             shutil.copyfileobj(file.file, buffer)
    #     except Exception as e:
    #         print(f"Error saving image: {e}")
    #         return ""
            
    #     return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    # ==================== 2. ADMIN: TEST CRUD ====================
    
    @staticmethod
    def create_test(db: Session, test_in: schemas.WritingTestCreate):
        db_test = AptisWritingTest(
            title=test_in.title, 
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.flush() 
        
        for p in test_in.parts:
            db_part = AptisWritingPart(
                test_id=db_test.id,
                part_number=p.part_number,
                part_type=p.part_type,
                instruction=p.instruction,
                image_url=p.image_url,
            )
            db.add(db_part)
            db.flush() 
            
            for q in p.questions:
                db_q = AptisWritingQuestion(
                    part_id=db_part.id,
                    question_text=q.question_text,
                    order_number=q.order_number,
                    sub_type=q.sub_type
                )
                db.add(db_q)
        
        db.commit()
        return AptisWritingService.get_test_detail(db, db_test.id)

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.WritingTestUpdate):
        test = db.query(AptisWritingTest).options(
            joinedload(AptisWritingTest.parts).joinedload(AptisWritingPart.questions)
        ).filter(AptisWritingTest.id == test_id).first()
        
        if not test: return None
        
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            # Xóa các part cũ
            test.parts = [] 
            db.flush()

            new_parts = []
            for p in test_in.parts:
                db_part = AptisWritingPart(
                    part_number=p.part_number,
                    part_type=p.part_type,
                    instruction=p.instruction,
                    image_url=p.image_url,
                )
                
                new_questions = [
                    AptisWritingQuestion(
                        question_text=q.question_text,
                        order_number=q.order_number,
                        sub_type=q.sub_type
                    ) for q in p.questions
                ]
                db_part.questions = new_questions
                new_parts.append(db_part)
            
            test.parts = new_parts

        db.commit()
        return AptisWritingService.get_test_detail(db, test.id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(AptisWritingTest).filter(AptisWritingTest.id == test_id).first()
        if not test: return False
        
        try:
            db.delete(test) 
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(AptisWritingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(AptisWritingTest.is_full_test_only == True)
            tests = query.order_by(AptisWritingTest.created_at.desc()).offset(skip).limit(limit).all()
            return tests
        else:
            query = query.filter(
                AptisWritingTest.is_published == True,
                AptisWritingTest.is_full_test_only == False
            )
            tests = query.order_by(AptisWritingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(AptisWritingSubmission).filter(
                        AptisWritingSubmission.test_id == test.id,
                        AptisWritingSubmission.user_id == current_user_id,
                        AptisWritingSubmission.is_full_test_only == False
                    ).order_by(AptisWritingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = {
                    "id": test.id,
                    "title": test.title,
                    "time_limit": test.time_limit,
                    "description": test.description,
                    "is_published": test.is_published,
                    "is_full_test_only": test.is_full_test_only,
                    "created_at": test.created_at,
                    "status": status_val
                }
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        test = db.query(AptisWritingTest).options(
            joinedload(AptisWritingTest.parts).joinedload(AptisWritingPart.questions)
        ).filter(AptisWritingTest.id == test_id).first()
        if not test: 
            return None
        return schemas.WritingTestResponse.model_validate(test)

    # ==================== 3. USER: SUBMIT ====================
    
    @staticmethod
    def create_submission(db: Session, user_id: int, sub_in: schemas.SubmitWriting):
        user_ans = sub_in.user_answers 
        if isinstance(user_ans, str):
            user_ans = json.loads(user_ans)

        sub = AptisWritingSubmission(
            user_id=user_id,
            test_id=sub_in.test_id,
            user_answers=user_ans, 
            status=AptisWritingStatus.PENDING.value,
            is_full_test_only=sub_in.is_full_test_only,
            submitted_at=datetime.now(),
        )
        # Khởi tạo mặc định nếu model không tự sinh
        sub.score = 0
        sub.cefr_level = "A0"
        
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return AptisWritingService.get_submission_detail(db, sub.id)

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(AptisWritingSubmission).options(joinedload(AptisWritingSubmission.test))\
                 .filter(AptisWritingSubmission.user_id == user_id, AptisWritingSubmission.is_full_test_only == False)\
                 .order_by(AptisWritingSubmission.submitted_at.desc())\
                 .all()
    
    @staticmethod
    def get_submission_detail(db: Session, sub_id: int):
        return db.query(AptisWritingSubmission)\
                 .options(
                    joinedload(AptisWritingSubmission.user), 
                     joinedload(AptisWritingSubmission.test)
                     .joinedload(AptisWritingTest.parts)
                     .joinedload(AptisWritingPart.questions),
                     joinedload(AptisWritingSubmission.grader) 
                 )\
                 .filter(AptisWritingSubmission.id == sub_id)\
                 .first()

    # =======================================================
    # 👑 ADMIN: SUBMISSION MANAGEMENT & MANUAL GRADING
    # =======================================================
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, is_full_test_only: Optional[bool] = False, status_filter: Optional[str] = None):
        query = db.query(AptisWritingSubmission).options(
            joinedload(AptisWritingSubmission.user),
            joinedload(AptisWritingSubmission.test),
            joinedload(AptisWritingSubmission.grader)
        )
        if is_full_test_only is not None:
            query = query.filter(AptisWritingSubmission.is_full_test_only == is_full_test_only)
        if status_filter:
            query = query.filter(AptisWritingSubmission.status == status_filter)
            
        # 🔥 FIX: Thêm bộ đếm tổng số lượng bản ghi để phục vụ cho giao diện Frontend
        total_count = query.count()
        items = query.order_by(AptisWritingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total_count,
            "items": items
        }

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(AptisWritingSubmission).options(
            joinedload(AptisWritingSubmission.user),
            joinedload(AptisWritingSubmission.test),
            joinedload(AptisWritingSubmission.grader)
        ).filter(
            AptisWritingSubmission.user_id == target_user_id
        ).order_by(AptisWritingSubmission.submitted_at.desc()).all()

    @staticmethod
    def grade_submission(db: Session, submission_id: int, grader_id: int, req: schemas.WritingGradeRequest):
        sub = db.query(AptisWritingSubmission).filter(AptisWritingSubmission.id == submission_id).first()
        if not sub:
            return None
            
        # 1. Cập nhật Điểm và Trình độ
        sub.score = req.score
        sub.cefr_level = req.cefr_level
        
        # 2. Cập nhật Feedback
        if req.teacher_feedback is not None:
            sub.teacher_feedback = req.teacher_feedback
            
        if req.overall_feedback is not None:
            sub.overall_feedback = req.overall_feedback
            
        # 3. Cập nhật trạng thái và "Chữ ký" người chấm
        sub.status = AptisWritingStatus.GRADED.value
        sub.graded_at = datetime.now()
        sub.graded_by = grader_id

        db.commit()
        
        return AptisWritingService.get_submission_detail(db, submission_id)