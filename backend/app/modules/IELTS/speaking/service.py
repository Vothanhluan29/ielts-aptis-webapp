from sqlalchemy.orm import Session, joinedload
from fastapi import UploadFile, HTTPException
import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional
import json 
from app.core.database import SessionLocal 
from app.modules.IELTS.speaking.models import (
    SpeakingTest, SpeakingPart, SpeakingQuestion, SpeakingSubmission, 
    SpeakingQuestionAnswer, SpeakingStatus
)
from app.modules.IELTS.speaking import schemas
from app.modules.subscriptions.service import SubscriptionService
from app.core.AI.speaking_grading import IELTS_Speaking_Grader

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

class SpeakingService:

    # =======================================================
    # 🛠️ UTILS
    # =======================================================
    @staticmethod
    def save_audio_file(file: UploadFile) -> str:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0) 
        
        if file_size < 8192: 
            raise HTTPException(status_code=400, detail="Audio file is empty or corrupted. Please check your microphone.")

        UPLOAD_DIR = "static/speaking_audio"
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
    def round_ielts_score(score: float) -> float:
        if score is None: return 0.0
        decimal = score - int(score)
        if decimal < 0.25: return float(int(score))
        if decimal < 0.75: return int(score) + 0.5
        return int(score) + 1.0

    # =======================================================
    # 📝 TEST CRUD (ADMIN)
    # =======================================================
    @staticmethod
    def create_test(db: Session, test_in: schemas.SpeakingTestCreate):
        db_test = SpeakingTest(
            title=test_in.title,
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.commit()
        db.refresh(db_test)

        # Lưu Parts và Questions
        for p in test_in.parts:
            db_part = SpeakingPart(
                test_id=db_test.id,
                part_number=p.part_number,
                instruction=p.instruction,
                cue_card=p.cue_card
            )
            db.add(db_part)
            db.flush() # Để lấy db_part.id gán cho questions

            for q in p.questions:
                db_q = SpeakingQuestion(
                    part_id=db_part.id,
                    question_text=q.question_text,
                    audio_question_url=q.audio_question_url,
                    sort_order=q.sort_order
                )
                db.add(db_q)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.SpeakingTestUpdate):
        test = db.query(SpeakingTest).filter(SpeakingTest.id == test_id).first()
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            # 🔥 ĐÃ SỬA: Xóa thông qua ORM Object để kích hoạt Cascade xóa Questions
            old_parts = db.query(SpeakingPart).filter(SpeakingPart.test_id == test_id).all()
            for old_part in old_parts:
                db.delete(old_part)
            
            db.flush() # Đẩy lệnh xóa xuống DB ngay lập tức
            
            # Tạo lại Parts và Questions mới
            for p in test_in.parts:
                db_part = SpeakingPart(
                    test_id=test.id,
                    part_number=p.part_number,
                    instruction=p.instruction,
                    cue_card=p.cue_card
                )
                db.add(db_part)
                db.flush()

                for q in p.questions:
                    db_q = SpeakingQuestion(
                        part_id=db_part.id,
                        question_text=q.question_text,
                        audio_question_url=q.audio_question_url,
                        sort_order=q.sort_order
                    )
                    db.add(db_q)

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(SpeakingTest).filter(SpeakingTest.id == test_id).first()
        if not test: return False
        try:
            db.query(SpeakingSubmission).filter(SpeakingSubmission.test_id == test_id).delete()
            db.delete(test)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(SpeakingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(SpeakingTest.is_full_test_only == True)
            tests = query.order_by(SpeakingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.SpeakingTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                SpeakingTest.is_published == True, 
                SpeakingTest.is_full_test_only == False
            )
            tests = query.order_by(SpeakingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(SpeakingSubmission).filter(
                        SpeakingSubmission.test_id == test.id,
                        SpeakingSubmission.user_id == current_user_id,
                        SpeakingSubmission.is_full_test_only == False
                    ).order_by(SpeakingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = schemas.SpeakingTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        # Joinload sâu 2 tầng: Test -> Parts -> Questions
        return db.query(SpeakingTest).options(
            joinedload(SpeakingTest.parts).joinedload(SpeakingPart.questions)
        ).filter(SpeakingTest.id == test_id).first()

    # =======================================================
    # 🎤 CORE FLOW: SAVE & FINISH
    # =======================================================
    @staticmethod
    def save_question_submission(db: Session, user_id: int, req: schemas.SaveSpeakingQuestionRequest):
        """Lưu câu trả lời cho TỪNG CÂU HỎI lẻ"""
        if not req.audio_url or not req.audio_url.strip():
            raise HTTPException(status_code=400, detail="Audio file URL cannot be empty. Please record and upload your answer.")

        submission = db.query(SpeakingSubmission).filter(
            SpeakingSubmission.user_id == user_id,
            SpeakingSubmission.test_id == req.test_id,
            SpeakingSubmission.status == SpeakingStatus.IN_PROGRESS.value,
            SpeakingSubmission.is_full_test_only == req.is_full_test_only
        ).first()

        if not submission:
            submission = SpeakingSubmission(
                user_id=user_id,
                test_id=req.test_id,
                status=SpeakingStatus.IN_PROGRESS.value,
                is_full_test_only = req.is_full_test_only,
                submitted_at=datetime.now()
            )
            db.add(submission)
            db.commit()
            db.refresh(submission)

        # Cập nhật Audio cho đúng Question ID (Upsert)
        existing_answer = db.query(SpeakingQuestionAnswer).filter(
            SpeakingQuestionAnswer.submission_id == submission.id,
            SpeakingQuestionAnswer.question_id == req.question_id
        ).first()

        if existing_answer:
            existing_answer.audio_url = req.audio_url
        else:
            new_answer = SpeakingQuestionAnswer(
                submission_id=submission.id,
                question_id=req.question_id,
                audio_url=req.audio_url
            )
            db.add(new_answer)

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def finish_test(db: Session, submission_id: int, user_id: int):
        sub = db.query(SpeakingSubmission).options(joinedload(SpeakingSubmission.answers))\
            .filter(
                SpeakingSubmission.id == submission_id,
                SpeakingSubmission.user_id == user_id
            ).first()
        
        if not sub: raise HTTPException(404, "Submission not found")

        # Đếm tổng số câu hỏi của bài test này
        total_questions = db.query(SpeakingQuestion).join(SpeakingPart).filter(SpeakingPart.test_id == sub.test_id).count()
        answered_questions = len(sub.answers)
        
        if answered_questions < total_questions:
            raise HTTPException(400, f"Vui lòng hoàn thành đủ {total_questions} câu hỏi trước khi nộp bài. (Bạn mới làm {answered_questions} câu)")

        # CHECK & TRỪ QUOTA
        if not sub.is_full_test_only:
            try:
                SubscriptionService.check_and_increment_quota(db, user_id, "SPEAKING")
            except Exception as e:
                raise HTTPException(400, str(e))

        sub.status = SpeakingStatus.SUBMITTED.value 
        sub.submitted_at = datetime.now()
        
        db.commit()
        db.refresh(sub)
        return sub

    # =======================================================
    # 🤖 AI GRADING (CẬP NHẬT CHẤM TỪNG CÂU)
    # =======================================================
    @staticmethod
    def process_ai_grading(submission_id: int):
        print(f"🎤 [AI START] Grading Speaking Submission #{submission_id}...")
        db = SessionLocal()
        try:
            # Joinload để lấy text câu hỏi trực tiếp từ Relationship
            sub = db.query(SpeakingSubmission).options(
                joinedload(SpeakingSubmission.answers).joinedload(SpeakingQuestionAnswer.question).joinedload(SpeakingQuestion.part)
            ).filter(SpeakingSubmission.id == submission_id).first()
            
            if not sub: return

            sub.status = SpeakingStatus.GRADING.value 
            db.commit()

            grader = IELTS_Speaking_Grader()
            
            total_fluency, total_lexical, total_grammar, total_pron = 0.0, 0.0, 0.0, 0.0
            question_count = 0
            
            combined_feedback = ""

            for answer in sub.answers:
                question_text = answer.question.question_text
                part_number = answer.question.part.part_number
                
                if not answer.audio_url:
                    print(f"❌ Audio URL empty for Question {answer.question_id}")
                    continue

                relative_path = answer.audio_url.split(f"{BASE_URL}/")[-1]
                
                if not os.path.exists(relative_path):
                    answer.transcript = "(System Error: Audio file missing)"
                    answer.feedback = "We couldn't locate your audio file. Please try recording again."
                    continue 
                
                # Chấm điểm 1 Câu
                ai_result = grader.grade_single_part(
                    audio_path=relative_path, 
                    question_text=question_text, 
                    part_number=part_number
                )
                
                answer.transcript = ai_result.get("transcript", "")
                
                ans_feedback = ai_result.get("feedback", "")
                answer.feedback = ans_feedback
                combined_feedback += f"**Part {part_number} - Q:** {question_text}\n{ans_feedback}\n\n"
                
                scores = ai_result.get("scores", {})
                answer.score_fluency = scores.get("fluency", 0.0)
                answer.score_lexical = scores.get("lexical", 0.0)
                answer.score_grammar = scores.get("grammar", 0.0)
                answer.score_pronunciation = scores.get("pronunciation", 0.0)
                
                answer.correction = ai_result.get("correction", [])

                total_fluency += answer.score_fluency
                total_lexical += answer.score_lexical
                total_grammar += answer.score_grammar
                total_pron += answer.score_pronunciation
                question_count += 1
            
            # Tính trung bình điểm của tất cả các câu hỏi
            if question_count > 0:
                sub.score_fluency = SpeakingService.round_ielts_score(total_fluency / question_count)
                sub.score_lexical = SpeakingService.round_ielts_score(total_lexical / question_count)
                sub.score_grammar = SpeakingService.round_ielts_score(total_grammar / question_count)
                sub.score_pronunciation = SpeakingService.round_ielts_score(total_pron / question_count)
                
                raw_band = (sub.score_fluency + sub.score_lexical + sub.score_grammar + sub.score_pronunciation) / 4
                sub.band_score = SpeakingService.round_ielts_score(raw_band)
                
                sub.overall_feedback = combined_feedback.strip()
                sub.status = SpeakingStatus.GRADED.value 
                sub.graded_at = datetime.now()
            else:
                sub.status = SpeakingStatus.ERROR.value 
                sub.overall_feedback = "All questions failed to process. Audio files might be missing or empty."

            db.commit()
            print(f"✅ [AI DONE] Speaking Graded. Band: {sub.band_score}")

        except Exception as e:
            print(f"❌ [AI ERROR] Speaking Grading: {e}")
            try:
                sub.status = SpeakingStatus.ERROR.value 
                sub.overall_feedback = f"System Error during grading: {str(e)}"
                db.commit()
            except:
                db.rollback()
        finally:
            db.close()

    # =======================================================
    # 📜 HISTORY & DETAIL
    # =======================================================
    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.test)
        ).filter(SpeakingSubmission.user_id == user_id,
                 SpeakingSubmission.is_full_test_only == False).order_by(SpeakingSubmission.submitted_at.desc()).all()

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        return db.query(SpeakingSubmission).options(
            # Join 3 tầng để hiển thị Result Page mượt mà
            joinedload(SpeakingSubmission.answers).joinedload(SpeakingQuestionAnswer.question),
            joinedload(SpeakingSubmission.test).joinedload(SpeakingTest.parts).joinedload(SpeakingPart.questions)
        ).filter(SpeakingSubmission.id == submission_id).first()
    
    #ADMIN: SUBMISSION MANAGEMENT
    @staticmethod
    def get_all_submissions_for_admin(
        db: Session, 
        skip: int = 0, 
        limit: int = 50, 
        status_filter: Optional[SpeakingStatus] = None
    ):
        query = db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.user),
            joinedload(SpeakingSubmission.test)
        )
        
        if status_filter:
            val = status_filter.value if hasattr(status_filter, 'value') else status_filter
            query = query.filter(SpeakingSubmission.status == val)
            
        return query.order_by(SpeakingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        return db.query(SpeakingSubmission).options(
            joinedload(SpeakingSubmission.user),
            joinedload(SpeakingSubmission.test)
        ).filter(
            SpeakingSubmission.user_id == target_user_id
        ).order_by(SpeakingSubmission.submitted_at.desc()).all()

