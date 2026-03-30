from sqlalchemy.orm import Session, joinedload
from fastapi import UploadFile, HTTPException
import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional
import json 
from app.core.database import SessionLocal 

# Import Models và Schemas
from .models import (
    AptisSpeakingTest, AptisSpeakingPart, AptisSpeakingQuestion, AptisSpeakingSubmission, 
    AptisSpeakingPartAnswer, AptisSpeakingStatus
)
from . import schemas
from app.modules.subscriptions.service import SubscriptionService

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

class AptisSpeakingService:

    # =======================================================
    # 🛠️ UTILS: QUẢN LÝ UPLOAD FILE
    # =======================================================
    @staticmethod
    def save_audio_file(file: UploadFile) -> str:
        """Lưu file ghi âm (Audio) và trả về Public URL"""
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size < 1024:
            raise HTTPException(status_code=400, detail="Audio file is empty or corrupted. Please check your microphone.")

        UPLOAD_DIR = "static/aptis_speaking_audio"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        filename_orig = file.filename.lower()
        ext = filename_orig.split('.')[-1] if '.' in filename_orig else 'webm'
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            print(f"Error saving audio: {e}")
            raise HTTPException(status_code=500, detail="Could not save the audio file on server.")
        
        return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    @staticmethod
    def upload_image(file: UploadFile) -> str:
        """Lưu file hình ảnh của đề thi (Dành riêng cho Admin)"""
        UPLOAD_DIR = "static/aptis_speaking_images" 
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

    # =======================================================
    # 📝 TEST CRUD (ADMIN)
    # =======================================================
    @staticmethod
    def create_test(db: Session, test_in: schemas.AptisSpeakingTestCreate):
        db_test = AptisSpeakingTest(
            title=test_in.title,
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.flush() 

        if test_in.parts:
            for p in test_in.parts:
                db_part = AptisSpeakingPart(
                    test_id=db_test.id,
                    part_number=p.part_number,
                    part_type=p.part_type,
                    instruction=p.instruction,
                    image_url=p.image_url,
                    image_url_2=p.image_url_2
                )
                db.add(db_part)
                db.flush() 

                for q in p.questions:
                    db_q = AptisSpeakingQuestion(
                        part_id=db_part.id,
                        order_number=q.order_number,
                        question_text=q.question_text,
                        audio_url=q.audio_url,
                        prep_time=q.prep_time,
                        response_time=q.response_time
                    )
                    db.add(db_q)
        
        db.commit()
        # Trả về query full data giống Writing
        return AptisSpeakingService.get_test_detail(db, db_test.id)

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.AptisSpeakingTestUpdate):
        test = db.query(AptisSpeakingTest).filter(AptisSpeakingTest.id == test_id).first()
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            db.query(AptisSpeakingPart).filter(AptisSpeakingPart.test_id == test_id).delete()
            db.flush()

            for p in test_in.parts:
                db_part = AptisSpeakingPart(
                    test_id=test.id,
                    part_number=p.part_number,
                    part_type=p.part_type,
                    instruction=p.instruction,
                    image_url=p.image_url,
                    image_url_2=p.image_url_2
                )
                db.add(db_part)
                db.flush()

                for q in p.questions:
                    db_q = AptisSpeakingQuestion(
                        part_id=db_part.id,
                        order_number=q.order_number,
                        question_text=q.question_text,
                        audio_url=q.audio_url,
                        prep_time=q.prep_time,
                        response_time=q.response_time
                    )
                    db.add(db_q)

        db.commit()
        return AptisSpeakingService.get_test_detail(db, test.id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(AptisSpeakingTest).filter(AptisSpeakingTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    @staticmethod
    def get_all_tests(
        db: Session, 
        current_user_id: Optional[int] = None, 
        skip: int = 0, limit: int = 100, 
        admin_view: bool = False, fetch_mock_only: bool = False
    ):
        query = db.query(AptisSpeakingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(AptisSpeakingTest.is_full_test_only == True)
            return query.order_by(AptisSpeakingTest.created_at.desc()).offset(skip).limit(limit).all()
        else:
            query = query.filter(
                AptisSpeakingTest.is_published == True, 
                AptisSpeakingTest.is_full_test_only == False
            )
            tests = query.order_by(AptisSpeakingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(AptisSpeakingSubmission).filter(
                        AptisSpeakingSubmission.test_id == test.id,
                        AptisSpeakingSubmission.user_id == current_user_id,
                        AptisSpeakingSubmission.is_full_test_only == False
                    ).order_by(AptisSpeakingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = {
                    "id": test.id,
                    "title": test.title,
                    "description": test.description,
                    "time_limit": test.time_limit,
                    "is_published": test.is_published,
                    "is_full_test_only": test.is_full_test_only,
                    "created_at": test.created_at,
                    "status": status_val
                }
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        return db.query(AptisSpeakingTest).options(
            joinedload(AptisSpeakingTest.parts).joinedload(AptisSpeakingPart.questions)
        ).filter(AptisSpeakingTest.id == test_id).first()

    # =======================================================
    # 🎤 CORE FLOW: SAVE PART & FINISH TEST
    # =======================================================
    @staticmethod
    def save_part_submission(db: Session, user_id: int, req: schemas.SaveAptisSpeakingPartRequest):
        if not req.audio_url or not req.audio_url.strip():
            raise HTTPException(status_code=400, detail="Audio file URL cannot be empty.")

        submission = db.query(AptisSpeakingSubmission).filter(
            AptisSpeakingSubmission.user_id == user_id,
            AptisSpeakingSubmission.test_id == req.test_id,
            AptisSpeakingSubmission.status == AptisSpeakingStatus.IN_PROGRESS.value,
            AptisSpeakingSubmission.is_full_test_only == req.is_full_test_only
        ).first()

        if not submission:
            submission = AptisSpeakingSubmission(
                user_id=user_id,
                test_id=req.test_id,
                status=AptisSpeakingStatus.IN_PROGRESS.value,
                is_full_test_only = req.is_full_test_only,
            )
            db.add(submission)
            db.commit()
            db.refresh(submission)

        existing_answer = db.query(AptisSpeakingPartAnswer).filter(
            AptisSpeakingPartAnswer.submission_id == submission.id,
            AptisSpeakingPartAnswer.part_number == req.part_number
        ).first()

        if existing_answer:
            existing_answer.audio_url = req.audio_url
        else:
            new_answer = AptisSpeakingPartAnswer(
                submission_id=submission.id,
                part_number=req.part_number,
                audio_url=req.audio_url
            )
            db.add(new_answer)

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def finish_test(db: Session, submission_id: int, user_id: int):
        sub = db.query(AptisSpeakingSubmission).options(joinedload(AptisSpeakingSubmission.answers))\
            .filter(
                AptisSpeakingSubmission.id == submission_id,
                AptisSpeakingSubmission.user_id == user_id
            ).first()
        
        if not sub: raise HTTPException(404, "Submission not found")

        submitted_parts = {a.part_number for a in sub.answers}
        required_parts = {1, 2, 3, 4} 
        
        if not required_parts.issubset(submitted_parts):
            missing = required_parts - submitted_parts
            raise HTTPException(400, f"Vui lòng hoàn thành đủ 4 phần thi. (Thiếu: Part {missing})")

        if not sub.is_full_test_only:
            try:
                SubscriptionService.check_and_increment_quota(db, user_id, "APTIS_SPEAKING")
            except Exception as e:
                raise HTTPException(400, str(e))

        # 🔥 ĐỔI STATUS: Gửi thẳng vào trạng thái PENDING chờ Giáo viên chấm
        sub.status = AptisSpeakingStatus.PENDING.value 
        sub.submitted_at = datetime.now()
        
        db.commit()
        db.refresh(sub)
        return sub

    # =======================================================
    # 📜 LỊCH SỬ & QUẢN LÝ ADMIN (PAGINATION)
    # =======================================================
    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.test)
        ).filter(AptisSpeakingSubmission.user_id == user_id,
                 AptisSpeakingSubmission.is_full_test_only == False).order_by(AptisSpeakingSubmission.submitted_at.desc()).all()

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        # 🔥 ĐÃ SỬA: Bổ sung user và grader để Frontend hiện tên đầy đủ
        return db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.user),
            joinedload(AptisSpeakingSubmission.grader),
            joinedload(AptisSpeakingSubmission.answers),
            joinedload(AptisSpeakingSubmission.test).joinedload(AptisSpeakingTest.parts).joinedload(AptisSpeakingPart.questions)
        ).filter(AptisSpeakingSubmission.id == submission_id).first()
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, is_full_test_only: Optional[bool] = False, status_filter: Optional[str] = None):
        query = db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.user),
            joinedload(AptisSpeakingSubmission.test),
            joinedload(AptisSpeakingSubmission.grader)
        )
        
        if status_filter:
            # So sánh chuỗi trực tiếp
            query = query.filter(AptisSpeakingSubmission.status == status_filter)
        if is_full_test_only is not None:
            query = query.filter(AptisSpeakingSubmission.is_full_test_only == is_full_test_only)
            
        total = query.count()
        items = query.order_by(AptisSpeakingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        # 🔥 ĐÃ SỬA: Trả về Dict để phục vụ Phân trang (Paging) UI
        return {"items": items, "total": total}

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.user),
            joinedload(AptisSpeakingSubmission.test),
            joinedload(AptisSpeakingSubmission.grader)
        ).filter(AptisSpeakingSubmission.user_id == target_user_id).order_by(AptisSpeakingSubmission.submitted_at.desc()).all()

    # =======================================================
    # 👑 MANUAL GRADING (Giáo viên chấm điểm)
    # =======================================================
    @staticmethod
    def grade_submission(db: Session, submission_id: int, grader_id: int, req: schemas.SpeakingGradeRequest):
        sub = db.query(AptisSpeakingSubmission).options(
            joinedload(AptisSpeakingSubmission.answers)
        ).filter(AptisSpeakingSubmission.id == submission_id).first()
        
        if not sub: return None
            
        # 1. Cập nhật Điểm tổng và Trình độ
        sub.total_score = req.total_score
        sub.cefr_level = req.cefr_level
        sub.overall_feedback = req.overall_feedback
        
        # 2. Cập nhật điểm và nhận xét cho TỪNG PART
        if req.part_feedbacks:
            for pf in req.part_feedbacks:
                # Tìm answer tương ứng với part_number
                answer = next((a for a in sub.answers if a.part_number == pf.part_number), None)
                if answer:
                    answer.part_score = pf.score
                    answer.admin_feedback = pf.comments
                
        # 3. Đánh dấu đã chấm
        sub.status = AptisSpeakingStatus.GRADED.value
        sub.graded_at = datetime.now()
        sub.graded_by = grader_id

        db.commit()
        # Lấy lại bản đầy đủ nhất để trả về cho Frontend
        return AptisSpeakingService.get_submission_detail(db, submission_id)