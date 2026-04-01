from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import List, Optional
from sqlalchemy import func
import os
import shutil
import uuid
from fastapi import UploadFile

from app.modules.IELTS.listening import models
from app.modules.IELTS.listening import schemas

class ListeningService:

    @staticmethod
    def save_image_file(file: UploadFile) -> str:
        """Lưu file hình ảnh vào thư mục local và trả về đường dẫn URL"""
        try:
            # 1. Kiểm tra định dạng (Chỉ cho phép file ảnh)
            allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in allowed_extensions:
                raise ValueError(f"Định dạng ảnh không hợp lệ. Chỉ hỗ trợ: {', '.join(allowed_extensions)}")

            # 2. Tạo thư mục lưu trữ (Phân biệt với audio)
            upload_dir = "static/images" 
            os.makedirs(upload_dir, exist_ok=True)

            # 3. Tạo tên file độc nhất
            new_filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(upload_dir, new_filename)

            # 4. Lưu file vào ổ cứng
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # 5. Trả về URL tương đối
            return f"/{upload_dir}/{new_filename}"

        except Exception as e:
            raise ValueError(f"Lỗi khi lưu ảnh: {str(e)}")

    # =======================================================
    # 🎧 UPLOAD AUDIO LOGIC (HÀM BỊ THIẾU GÂY LỖI 400)
    # =======================================================
    @staticmethod
    def save_audio_file(file: UploadFile) -> str:
        """Lưu file audio vào thư mục local và trả về đường dẫn URL"""
        try:
            # 1. Kiểm tra định dạng (Bảo mật)
            allowed_extensions = [".mp3", ".wav", ".m4a", ".ogg", ".aac"]
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in allowed_extensions:
                raise ValueError(f"Định dạng không hợp lệ. Chỉ hỗ trợ: {', '.join(allowed_extensions)}")

            # 2. Tạo thư mục lưu trữ (nếu chưa có)
            upload_dir = "static/audio" 
            os.makedirs(upload_dir, exist_ok=True)

            # 3. Tạo tên file độc nhất để không bị ghi đè
            new_filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(upload_dir, new_filename)

            # 4. Lưu file vào ổ cứng
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # 5. Trả về URL tương đối
            return f"/{upload_dir}/{new_filename}"

        except Exception as e:
            raise ValueError(f"Lỗi khi lưu file: {str(e)}")

    # =======================================================
    # 💯 TÍNH ĐIỂM & SO SÁNH
    # =======================================================
    @staticmethod
    def calculate_ielts_band(correct_count: int) -> float:
        """Thang điểm chuẩn IELTS Academic/General Listening"""
        if correct_count >= 39: return 9.0
        if correct_count >= 37: return 8.5
        if correct_count >= 35: return 8.0
        if correct_count >= 32: return 7.5
        if correct_count >= 30: return 7.0
        if correct_count >= 26: return 6.5
        if correct_count >= 23: return 6.0
        if correct_count >= 18: return 5.5
        if correct_count >= 16: return 5.0
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
            
        accepted_cleaned = [ListeningService.clean_text(ans) for ans in correct_answers]
        
        if isinstance(user_ans, list):
            user_cleaned = [ListeningService.clean_text(a) for a in user_ans]
            return set(user_cleaned) == set(accepted_cleaned)
            
        cleaned_student = ListeningService.clean_text(user_ans)
        return cleaned_student in accepted_cleaned

    # =======================================================
    # 📚 TEST MANAGEMENT (CRUD - ADMIN)
    # =======================================================
    @staticmethod
    def create_test(db: Session, test_in: schemas.ListeningTestCreateOrUpdate):
        db_test = models.ListeningTest(
            title=test_in.title, 
            description=test_in.description, 
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only 
        )
        db.add(db_test)
        db.flush() 

        for p_data in test_in.parts:
            db_part = models.ListeningPart(
                test_id=db_test.id,
                part_number=p_data.part_number,
                audio_url=p_data.audio_url,
                transcript=p_data.transcript
            )
            db.add(db_part)
            db.flush()

            for g_data in p_data.groups:
                db_group = models.ListeningQuestionGroup(
                    part_id=db_part.id,
                    instruction=g_data.instruction,
                    image_url=g_data.image_url,
                    order=g_data.order
                )
                db.add(db_group)
                db.flush()

                for q_data in g_data.questions:
                    db_question = models.ListeningQuestion(
                        group_id=db_group.id,
                        question_number=q_data.question_number,
                        question_text=q_data.question_text,
                        question_type=q_data.question_type,
                        options=q_data.options,
                        correct_answers=q_data.correct_answers, 
                        explanation=q_data.explanation
                    )
                    db.add(db_question)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.ListeningTestCreateOrUpdate):
        test = db.query(models.ListeningTest).options(
            joinedload(models.ListeningTest.parts)
        ).filter(models.ListeningTest.id == test_id).first()
        
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            test.parts = [] 
            db.flush() 

            new_parts = []
            for p_data in test_in.parts:
                db_part = models.ListeningPart(
                    part_number=p_data.part_number,
                    audio_url=p_data.audio_url,
                    transcript=p_data.transcript
                )

                for g_data in p_data.groups:
                    db_group = models.ListeningQuestionGroup(
                        instruction=g_data.instruction,
                        image_url=g_data.image_url,
                        order=g_data.order
                    )

                    for q_data in g_data.questions:
                        db_question = models.ListeningQuestion(
                            question_number=q_data.question_number,
                            question_text=q_data.question_text,
                            question_type=q_data.question_type,
                            options=q_data.options,
                            correct_answers=q_data.correct_answers, 
                            explanation=q_data.explanation
                        )
                        db_group.questions.append(db_question)

                    db_part.groups.append(db_group)
                
                new_parts.append(db_part)

            test.parts = new_parts

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(models.ListeningTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.ListeningTest.is_full_test_only == True)
            tests = query.order_by(models.ListeningTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.ListeningTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                models.ListeningTest.is_published == True,
                models.ListeningTest.is_full_test_only == False 
            )
            tests = query.order_by(models.ListeningTest.created_at.desc()).offset(skip).limit(limit).all()
            
            result_list = []
            for test in tests:
                status = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(models.ListeningSubmission).filter(
                        models.ListeningSubmission.test_id == test.id,
                        models.ListeningSubmission.user_id == current_user_id,
                        models.ListeningSubmission.is_full_test_only == False
                    ).order_by(models.ListeningSubmission.submitted_at.desc()).first()
                    
                    if latest_sub:
                        status = latest_sub.status
                
                test_dict = schemas.ListeningTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status
                result_list.append(test_dict)
                
            return result_list

    @staticmethod
    def get_full_test_data(db: Session, test_id: int):
        return db.query(models.ListeningTest).options(
            joinedload(models.ListeningTest.parts)
            .joinedload(models.ListeningPart.groups)
            .joinedload(models.ListeningQuestionGroup.questions)
        ).filter(models.ListeningTest.id == test_id).first()
    
    get_test_detail = get_full_test_data

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(models.ListeningTest).filter(models.ListeningTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    # =======================================================
    # 🏆 SUBMISSION LOGIC (CHẤM ĐIỂM)
    # =======================================================
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.SubmitAnswer):
        test = ListeningService.get_full_test_data(db, submission_data.test_id)
        if not test: return None

        all_questions = []
        for part in test.parts:
            for group in part.groups:
                all_questions.extend(group.questions)

        correct_count = 0
        answers_to_store = submission_data.user_answers or {} 
        detailed_results = []
        
        for q in all_questions:
            q_num_str = str(q.question_number)
            user_ans = answers_to_store.get(q_num_str)
            
            is_correct = ListeningService.check_is_correct(user_ans, q.correct_answers)

            if is_correct: correct_count += 1

            detailed_results.append({
                "id": q.id, 
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": user_ans,
                "correct_answers": q.correct_answers, 
                "is_correct": is_correct,
                "explanation": q.explanation
            })

        band_score = ListeningService.calculate_ielts_band(correct_count)
        
        db_submission = models.ListeningSubmission(
            user_id=user_id,
            test_id=test.id,
            user_answers=answers_to_store,
            correct_count=correct_count,
            band_score=band_score,
            submitted_at=datetime.now(),
            status=models.ListeningStatus.GRADED.value,
            is_full_test_only=submission_data.is_full_test_only
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        
        return schemas.SubmissionDetail(
            id=db_submission.id,
            test_id=db_submission.test_id,
            test={"id": test.id, "title": test.title},
            user_id=db_submission.user_id,
            status=db_submission.status,
            is_full_test_only=db_submission.is_full_test_only,
            band_score=db_submission.band_score,
            correct_count=db_submission.correct_count,
            total_questions=len(all_questions),
            submitted_at=db_submission.submitted_at,
            user_answers=db_submission.user_answers,
            results=detailed_results
        )

    # =======================================================
    # 📜 HISTORY & DETAILS (BẢN TỐI ƯU HÓA)
    # =======================================================
    
    @staticmethod
    def _get_test_question_count(db: Session, test_id: int, cache: dict) -> int:
        if test_id in cache:
            return cache[test_id]
        
        total_q = db.query(func.count(models.ListeningQuestion.id))\
            .join(models.ListeningQuestionGroup)\
            .join(models.ListeningPart)\
            .filter(models.ListeningPart.test_id == test_id).scalar() or 0
            
        cache[test_id] = total_q
        return total_q

    @staticmethod
    def get_student_history(db: Session, user_id: int):
        results = (
            db.query(models.ListeningSubmission, models.ListeningTest)
            .join(models.ListeningTest, models.ListeningSubmission.test_id == models.ListeningTest.id)
            .filter(models.ListeningSubmission.user_id == user_id, models.ListeningSubmission.is_full_test_only == False)
            .order_by(models.ListeningSubmission.submitted_at.desc())
            .all()
        )
        
        history_list = []
        test_counts_cache = {} 
        
        for sub, test in results:
            total_q = ListeningService._get_test_question_count(db, test.id, test_counts_cache)

            history_list.append(
                schemas.SubmissionSummary(
                    id=sub.id, 
                    test_id=sub.test_id, 
                    test={"id": test.id, "title": test.title},
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    band_score=sub.band_score, 
                    correct_count=sub.correct_count,
                    total_questions=total_q, 
                    submitted_at=sub.submitted_at
                )
            )
        return history_list

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        submission = db.query(models.ListeningSubmission).filter(models.ListeningSubmission.id == submission_id).first()
        if not submission: return None
        
        test = ListeningService.get_full_test_data(db, submission.test_id)
        
        all_questions = []
        if test:
             for part in test.parts:
                for group in part.groups:
                    all_questions.extend(group.questions)
        
        all_questions.sort(key=lambda x: x.question_number)

        detailed_results = []
        student_answers_map = submission.user_answers or {} 
        
        for q in all_questions:
            q_num = str(q.question_number)
            student_ans = student_answers_map.get(q_num)
            
            is_correct = ListeningService.check_is_correct(student_ans, q.correct_answers)

            detailed_results.append({
                "id": q.id,
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": student_ans,
                "correct_answers": q.correct_answers, 
                "is_correct": is_correct,
                "explanation": q.explanation
            })
            
        return schemas.SubmissionDetail(
            id=submission.id,
            test_id=submission.test_id,
            test={"id": test.id, "title": test.title} if test else None, 
            user_id=submission.user_id,
            status=submission.status,
            is_full_test_only=submission.is_full_test_only,
            band_score=submission.band_score, 
            correct_count=submission.correct_count,
            total_questions=len(all_questions),
            submitted_at=submission.submitted_at,
            user_answers=submission.user_answers,
            results=detailed_results 
        )

    # =======================================================
    # 👑 ADMIN: SUBMISSION MANAGEMENT
    # =======================================================
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(models.ListeningSubmission).options(
            joinedload(models.ListeningSubmission.user),
            joinedload(models.ListeningSubmission.test)
        )
        
        if status_filter:
            query = query.filter(models.ListeningSubmission.status == status_filter)
            
        submissions = query.order_by(models.ListeningSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        results = []
        test_counts_cache = {} 
        
        for sub in submissions:
            total_q = 0
            if sub.test:
                total_q = ListeningService._get_test_question_count(db, sub.test_id, test_counts_cache)

            results.append(
                schemas.AdminListeningSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title} if sub.test else None,
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    band_score=sub.band_score,
                    correct_count=sub.correct_count,
                    total_questions=total_q,
                    submitted_at=sub.submitted_at,
                    user_answers={}, 
                    results=[]      
                )
            )
        return results

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        submissions = db.query(models.ListeningSubmission).options(
            joinedload(models.ListeningSubmission.user),
            joinedload(models.ListeningSubmission.test)
        ).filter(
            models.ListeningSubmission.user_id == target_user_id
        ).order_by(models.ListeningSubmission.submitted_at.desc()).all()

        results = []
        test_counts_cache = {}
        
        for sub in submissions:
            total_q = 0
            if sub.test:
                total_q = ListeningService._get_test_question_count(db, sub.test_id, test_counts_cache)

            results.append(
                schemas.AdminListeningSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title} if sub.test else None,
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    band_score=sub.band_score,
                    correct_count=sub.correct_count,
                    total_questions=total_q, 
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]
                )
            )
        return results