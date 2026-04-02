import os
import shutil
import uuid
import json
from sqlalchemy.orm import Session, joinedload
from fastapi import UploadFile, HTTPException, status
from typing import Optional, List

from app.modules.APTIS.listening.models import (
    AptisListeningTest, 
    AptisListeningPart, 
    AptisListeningQuestionGroup, 
    AptisListeningQuestion, 
    AptisListeningSubmission,
    AptisListeningStatus
)
from app.modules.APTIS.listening import schemas

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

class AptisListeningService:

    # =======================================================
    # 📁 1. FILE UPLOAD 
    # =======================================================
    @staticmethod
    def save_audio_file(file: UploadFile) -> str:
        allowed_extensions = {".mp3", ".wav", ".ogg", ".m4a"}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
            )

        UPLOAD_DIR = "static/audio/aptis_listening"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
            
        return f"{BASE_URL}/{UPLOAD_DIR}/{filename}"

    # =======================================================
    # 📝 2. TEST CRUD (ADMIN)
    # =======================================================
    
    @staticmethod
    def create_test(db: Session, test_in: schemas.ListeningTestCreate):
        try:
            db_test = AptisListeningTest(
                title=test_in.title, 
                description=test_in.description, 
                time_limit=test_in.time_limit,
                is_published=test_in.is_published,
                is_full_test_only=test_in.is_full_test_only
            )
            db.add(db_test)
            db.flush() 

            if test_in.parts:
                for p_data in test_in.parts:
                    db_part = AptisListeningPart(
                        test_id=db_test.id,
                        title=p_data.title,
                        part_number=p_data.part_number
                    )
                    db.add(db_part)
                    db.flush()

                    if p_data.groups:
                        for g_data in p_data.groups:
                            db_group = AptisListeningQuestionGroup(
                                part_id=db_part.id,
                                instruction=g_data.instruction,
                                image_url=g_data.image_url,
                                order=g_data.order,
                                audio_url=g_data.audio_url, 
                                transcript=g_data.transcript 
                            )
                            db.add(db_group)
                            db.flush()

                            if g_data.questions:
                                for q_data in g_data.questions:
                                    db_question = AptisListeningQuestion(
                                        group_id=db_group.id,
                                        question_number=q_data.question_number,
                                        question_text=q_data.question_text,
                                        question_type=q_data.question_type,
                                        options=q_data.options,
                                        correct_answer=q_data.correct_answer,
                                        explanation=q_data.explanation,
                                        audio_url=q_data.audio_url
                                    )
                                    db.add(db_question)
            
            db.commit()
            return AptisListeningService.get_test_detail(db, db_test.id)
            
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.ListeningTestUpdate):
        test = db.query(AptisListeningTest).filter(AptisListeningTest.id == test_id).first()
        if not test: return None
        
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description 
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            db.query(AptisListeningPart).filter(AptisListeningPart.test_id == test_id).delete(synchronize_session=False)
            db.flush()

            for p_data in test_in.parts:
                db_part = AptisListeningPart(test_id=test.id, part_number=p_data.part_number)
                db.add(db_part)
                db.flush()

                if p_data.groups:
                    for g_data in p_data.groups:
                        db_group = AptisListeningQuestionGroup(
                            part_id=db_part.id,
                            instruction=g_data.instruction,
                            image_url=g_data.image_url,
                            order=g_data.order,
                            audio_url=g_data.audio_url,
                            transcript=g_data.transcript
                        )
                        db.add(db_group)
                        db.flush()

                        if g_data.questions:
                            for q_data in g_data.questions:
                                db_question = AptisListeningQuestion(
                                    group_id=db_group.id,
                                    question_number=q_data.question_number,
                                    question_text=q_data.question_text,
                                    question_type=q_data.question_type,
                                    options=q_data.options,
                                    correct_answer=q_data.correct_answer,
                                    explanation=q_data.explanation,
                                    audio_url=q_data.audio_url
                                )
                                db.add(db_question)

        db.commit()
        return AptisListeningService.get_test_detail(db, test.id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(AptisListeningTest).filter(AptisListeningTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(AptisListeningTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(AptisListeningTest.is_full_test_only == True)
            tests = query.order_by(AptisListeningTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.ListeningTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                AptisListeningTest.is_published == True,
                AptisListeningTest.is_full_test_only == False
            )
            tests = query.order_by(AptisListeningTest.created_at.desc()).offset(skip).limit(limit).all()
            
            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(AptisListeningSubmission).filter(
                        AptisListeningSubmission.test_id == test.id,
                        AptisListeningSubmission.user_id == current_user_id,
                        AptisListeningSubmission.is_full_test_only == False
                    ).order_by(AptisListeningSubmission.submitted_at.desc()).first()
                    
                    if latest_sub:
                        status_val = latest_sub.status
                
                test_dict = schemas.ListeningTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)
                
            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        test =  (
            db.query(AptisListeningTest)
            .options(
                joinedload(AptisListeningTest.parts)
                .joinedload(AptisListeningPart.groups)
                .joinedload(AptisListeningQuestionGroup.questions)
            )
            .filter(AptisListeningTest.id == test_id)
            .first()
        )
        if not test:
            return None
        return schemas.ListeningTestResponse.model_validate(test)

    # =======================================================
    # 🏆 3. SCORING & SUBMISSION
    # =======================================================
    
    @staticmethod
    def normalize_answer(text: str) -> str:
        if not text: return ""
        cleaned = str(text).strip().lower()
        if cleaned.endswith('.'): cleaned = cleaned[:-1]
        return " ".join(cleaned.split())

    @staticmethod
    def calculate_aptis_score_and_cefr(correct_count: int, total_questions: int = 25) -> dict:
        if total_questions > 0:
            scale_score = round((correct_count / total_questions) * 50)
        else:
            scale_score = 0

        cefr = "A0"
        if correct_count >= 21:    cefr = "C"
        elif correct_count >= 17:  cefr = "B2"
        elif correct_count >= 12:  cefr = "B1"
        elif correct_count >= 6:   cefr = "A2"
        elif correct_count >= 1:   cefr = "A1"
            
        return {
            "score": scale_score,
            "cefr_level": cefr
        }

    @staticmethod
    def submit_test(db: Session, user_id: int, submission_in: schemas.SubmitAnswer):
        test = db.query(AptisListeningTest).filter(AptisListeningTest.id == submission_in.test_id).first()
        if not test: return None

        questions = (
            db.query(AptisListeningQuestion)
            .join(AptisListeningQuestionGroup)
            .join(AptisListeningPart)
            .filter(AptisListeningPart.test_id == submission_in.test_id)
            .order_by(AptisListeningQuestion.question_number) 
            .all()
        )
        if not questions: return None

        correct_count = 0
        detailed_results = []
        
        incoming_answers = getattr(submission_in, 'user_answers', None) or getattr(submission_in, 'answers', {})
        user_answers_map = {str(k): v for k, v in incoming_answers.items()}

        for q in questions:
            q_id = str(q.id)
            q_num = str(q.question_number)
            
            user_ans = user_answers_map.get(q_id)
            if user_ans is None:
                user_ans = user_answers_map.get(q_num, "")
                
            # 🔥 BỘ DỊCH MINI ĐỂ CHẤM ĐIỂM
            actual_ans = str(user_ans).strip()
            try:
                opts = json.loads(q.options) if isinstance(q.options, str) else (q.options or {})
                if isinstance(opts, dict): 
                    actual_ans = str(opts.get(user_ans, user_ans))
                elif isinstance(opts, list) and actual_ans.isdigit(): 
                    idx = int(actual_ans)
                    if 0 <= idx < len(opts): actual_ans = str(opts[idx])
            except Exception:
                pass
            
            norm_user = AptisListeningService.normalize_answer(actual_ans)
            norm_correct = AptisListeningService.normalize_answer(q.correct_answer)
            
            is_correct = False
            if norm_user and norm_correct:
                possible_answers = [ans.strip() for ans in norm_correct.split('|')]
                is_correct = norm_user in possible_answers
            
            if is_correct: correct_count += 1
            
            detailed_results.append({
                "id": q.id,
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": user_ans, 
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation
            })
        
        scoring_result = AptisListeningService.calculate_aptis_score_and_cefr(correct_count, len(questions))

        db_submission = AptisListeningSubmission(
            user_id=user_id,
            test_id=submission_in.test_id,
            user_answers=incoming_answers, 
            correct_count=correct_count,
            score=scoring_result["score"],
            cefr_level=scoring_result["cefr_level"],
            status=AptisListeningStatus.GRADED.value,
            is_full_test_only=submission_in.is_full_test_only
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        
        return schemas.SubmissionDetail(
            id=db_submission.id,
            test_id=db_submission.test_id,
            test={"id": test.id, "title": test.title, "description": test.description},
            user_id=db_submission.user_id,
            status=db_submission.status,
            is_full_test_only=db_submission.is_full_test_only,
            correct_count=db_submission.correct_count,
            score=db_submission.score,
            cefr_level=db_submission.cefr_level,
            total_questions=len(questions),
            submitted_at=db_submission.submitted_at,
            user_answers=db_submission.user_answers,
            results=detailed_results
        )

    # =======================================================
    # 📜 4. HISTORY & ADMIN SUBMISSIONS
    # =======================================================
    @staticmethod
    def get_my_submissions(db: Session, user_id: int):
        submissions = (
            db.query(AptisListeningSubmission)
            .options(joinedload(AptisListeningSubmission.test))
            .filter(AptisListeningSubmission.user_id == user_id, AptisListeningSubmission.is_full_test_only == False)
            .order_by(AptisListeningSubmission.submitted_at.desc())
            .all()
        )
        return [
            schemas.SubmissionSummary(
                id=sub.id,
                test_id=sub.test_id,
                test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None,
                status=sub.status,
                is_full_test_only=sub.is_full_test_only,
                score=sub.score,
                cefr_level=sub.cefr_level,
                correct_count=sub.correct_count,
                submitted_at=sub.submitted_at
            ) for sub in submissions
        ]

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        sub = db.query(AptisListeningSubmission).options(joinedload(AptisListeningSubmission.test)).filter(AptisListeningSubmission.id == submission_id).first()
        if not sub: return None

        questions = (
            db.query(AptisListeningQuestion)
            .join(AptisListeningQuestionGroup)
            .join(AptisListeningPart)
            .filter(AptisListeningPart.test_id == sub.test_id)
            .order_by(AptisListeningQuestion.question_number)
            .all()
        )

        detailed_results = []
        user_answers_json = sub.user_answers or {}
        user_answers_map = {str(k): v for k, v in user_answers_json.items()}

        for q in questions:
            q_id = str(q.id)
            q_num = str(q.question_number)
            user_ans = user_answers_map.get(q_id)
            if user_ans is None:
                user_ans = user_answers_map.get(q_num, "")
            
            # 🔥 BỘ DỊCH MINI ĐỂ LẤY LỊCH SỬ CHÍNH XÁC
            actual_ans = str(user_ans).strip()
            try:
                opts = json.loads(q.options) if isinstance(q.options, str) else (q.options or {})
                if isinstance(opts, dict): 
                    actual_ans = str(opts.get(user_ans, user_ans))
                elif isinstance(opts, list) and actual_ans.isdigit(): 
                    idx = int(actual_ans)
                    if 0 <= idx < len(opts): actual_ans = str(opts[idx])
            except Exception:
                pass
            
            norm_user = AptisListeningService.normalize_answer(actual_ans)
            norm_correct = AptisListeningService.normalize_answer(q.correct_answer)
            
            is_correct = False
            if norm_user and norm_correct:
                possible = [ans.strip() for ans in norm_correct.split('|')]
                is_correct = norm_user in possible

            detailed_results.append({
                "id": q.id,
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": user_ans,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation
            })
            
        return schemas.SubmissionDetail(
            id=sub.id,
            test_id=sub.test_id,
            test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, 
            user_id=sub.user_id,
            status=sub.status,
            is_full_test_only=sub.is_full_test_only,
            score=sub.score,
            cefr_level=sub.cefr_level,
            correct_count=sub.correct_count,
            total_questions=len(questions),
            submitted_at=sub.submitted_at,
            user_answers=sub.user_answers,
            results=detailed_results
        )

    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(AptisListeningSubmission).options(
            joinedload(AptisListeningSubmission.user),
            joinedload(AptisListeningSubmission.test)
        )
        if status_filter:
            query = query.filter(AptisListeningSubmission.status == status_filter)
            
        submissions = query.order_by(AptisListeningSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        results = []
        for sub in submissions:
            results.append(
                schemas.AdminListeningSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test=schemas.TestTitleOnly(id=sub.test.id, title=sub.test.title, description=sub.test.description) if sub.test else None, 
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    correct_count=sub.correct_count,
                    total_questions=25,
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]       
                )
            )
        return results
    
    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        """Lấy lịch sử làm bài Listening của một user cụ thể"""
        submissions = db.query(AptisListeningSubmission).options(
            joinedload(AptisListeningSubmission.user),
            joinedload(AptisListeningSubmission.test)
        ).filter(
            AptisListeningSubmission.user_id == target_user_id
        ).order_by(AptisListeningSubmission.submitted_at.desc()).all()

        results = []
        for sub in submissions:
            results.append(
                schemas.AdminListeningSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test=schemas.TestTitleOnly(id=sub.test.id, title=sub.test.title, description=sub.test.description) if sub.test else None,
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    correct_count=sub.correct_count,
                    total_questions=25,
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]       
                )
            )
        return results

    @staticmethod
    def override_submission_score(db: Session, submission_id: int, req: schemas.ListeningScoreOverrideRequest):
        sub = db.query(AptisListeningSubmission).filter(AptisListeningSubmission.id == submission_id).first()
        if not sub:
            return None
            
        sub.score = req.score
        if req.correct_count is not None:
            sub.correct_count = req.correct_count 
        if req.cefr_level is not None:
            sub.cefr_level = req.cefr_level
            
        db.commit()
        return AptisListeningService.get_submission_detail(db, submission_id)