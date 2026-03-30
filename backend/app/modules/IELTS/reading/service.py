from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime
from typing import List, Optional
from sqlalchemy import func

from app.modules.IELTS.reading import models
from app.modules.IELTS.reading import schemas

class ReadingService:
    @staticmethod
    def calculate_ielts_band(correct_count: int) -> float:
        """Thang điểm chuẩn IELTS Academic Reading"""
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
        """Dọn dẹp text: đưa về chữ thường, xóa khoảng trắng thừa ở 2 đầu và ở giữa"""
        if text is None: return ""
        return " ".join(str(text).strip().lower().split())

    # 🔥 HÀM MỚI: Xử lý so sánh siêu việt (Hỗ trợ cả String và Array)
    @staticmethod
    def check_is_correct(user_ans, correct_answers: list) -> bool:
        # Nếu user bỏ trống hoặc data lỗi
        if user_ans is None or user_ans == "" or user_ans == []:
            return False
        if not correct_answers:
            return False
            
        accepted_cleaned = [ReadingService.clean_text(ans) for ans in correct_answers]
        
        # Xử lý dạng bài chọn nhiều đáp án (MULTIPLE_ANSWER) -> user_ans là list
        if isinstance(user_ans, list):
            user_cleaned = [ReadingService.clean_text(a) for a in user_ans]
            # Dùng set() để bất chấp thứ tự (VD: user chọn C, A vẫn khớp với A, C)
            return set(user_cleaned) == set(accepted_cleaned)
            
        # Xử lý các dạng bài 1 đáp án (String)
        cleaned_student = ReadingService.clean_text(user_ans)
        return cleaned_student in accepted_cleaned

    # =======================================================
    # TEST MANAGEMENT (CRUD - ADMIN)
    # =======================================================
    @staticmethod
    def create_test(db: Session, test_in: schemas.TestCreateOrUpdate):
        db_test = models.ReadingTest(
            title=test_in.title, 
            time_limit=test_in.time_limit,
            description=test_in.description,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only 
        )
        db.add(db_test)
        db.flush() 

        for p_data in test_in.passages:
            db_passage = models.ReadingPassage(
                test_id=db_test.id,
                title=p_data.title,
                content=p_data.content,
                order=p_data.order
            )
            db.add(db_passage)
            db.flush()

            for g_data in p_data.groups:
                db_group = models.ReadingQuestionGroup(
                    passage_id=db_passage.id,
                    instruction=g_data.instruction,
                    image_url=g_data.image_url,
                    order=g_data.order
                )
                db.add(db_group)
                db.flush()

                for q_data in g_data.questions:
                    db_question = models.ReadingQuestion(
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
    def update_test(db: Session, test_id: int, test_in: schemas.TestCreateOrUpdate):
        test = db.query(models.ReadingTest).options(
            joinedload(models.ReadingTest.passages)
        ).filter(models.ReadingTest.id == test_id).first()
        
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.description is not None: test.description = test_in.description
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.passages is not None:
            test.passages = [] 
            db.flush() 

            new_passages = []
            for p_data in test_in.passages:
                db_passage = models.ReadingPassage(
                    title=p_data.title,
                    content=p_data.content,
                    order=p_data.order
                )

                for g_data in p_data.groups:
                    db_group = models.ReadingQuestionGroup(
                        instruction=g_data.instruction,
                        image_url=g_data.image_url,
                        order=g_data.order
                    )

                    for q_data in g_data.questions:
                        db_question = models.ReadingQuestion(
                            question_number=q_data.question_number,
                            question_text=q_data.question_text,
                            question_type=q_data.question_type,
                            options=q_data.options,
                            correct_answers=q_data.correct_answers, 
                            explanation=q_data.explanation
                        )
                        db_group.questions.append(db_question)

                    db_passage.groups.append(db_group)
                
                new_passages.append(db_passage)

            test.passages = new_passages

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(models.ReadingTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.ReadingTest.is_full_test_only == True)
            tests = query.order_by(models.ReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.TestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                models.ReadingTest.is_published == True,
                models.ReadingTest.is_full_test_only == False 
            )
            tests = query.order_by(models.ReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            
            result_list = []
            for test in tests:
                status = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(models.ReadingSubmission).filter(
                        models.ReadingSubmission.test_id == test.id,
                        models.ReadingSubmission.user_id == current_user_id,
                        models.ReadingSubmission.is_full_test_only == False
                    ).order_by(models.ReadingSubmission.submitted_at.desc()).first()
                    
                    if latest_sub:
                        status = latest_sub.status
                
                test_dict = schemas.TestListItem.model_validate(test).model_dump()
                test_dict['status'] = status
                result_list.append(test_dict)
                
            return result_list

    @staticmethod
    def get_full_test_data(db: Session, test_id: int):
        return db.query(models.ReadingTest).options(
            joinedload(models.ReadingTest.passages)
            .joinedload(models.ReadingPassage.groups)
            .joinedload(models.ReadingQuestionGroup.questions)
        ).filter(models.ReadingTest.id == test_id).first()
    
    get_test_detail = get_full_test_data

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(models.ReadingTest).filter(models.ReadingTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    # =======================================================
    # 🏆 SUBMISSION LOGIC (USER - PRACTICE MODE)
    # =======================================================
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.StudentSubmissionRequest):
        test = ReadingService.get_full_test_data(db, submission_data.test_id)
        if not test: return None

        all_questions = []
        for passage in test.passages:
            for group in passage.groups:
                all_questions.extend(group.questions)

        correct_count = 0
        answers_to_store = submission_data.user_answers or {} 
        detailed_results = []
        
        for q in all_questions:
            # 🔥 FIX TẬN GỐC: Chỉ lấy đáp án dựa vào câu số, KHÔNG được đụng vào ID
            q_num_str = str(q.question_number)
            user_ans = answers_to_store.get(q_num_str)
            
            # 🔥 SỬ DỤNG HÀM SO SÁNH THÔNG MINH
            is_correct = ReadingService.check_is_correct(user_ans, q.correct_answers)

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

        band_score = ReadingService.calculate_ielts_band(correct_count)
        
        db_submission = models.ReadingSubmission(
            user_id=user_id,
            test_id=test.id,
            user_answers=answers_to_store,
            correct_count=correct_count,
            band_score=band_score,
            submitted_at=datetime.now(),
            status=models.ReadingStatus.GRADED.value,
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
    # 📜 HISTORY
    # =======================================================
    @staticmethod
    def get_student_history(db: Session, user_id: int):
        results = (
            db.query(models.ReadingSubmission, models.ReadingTest)
            .join(models.ReadingTest, models.ReadingSubmission.test_id == models.ReadingTest.id)
            .filter(models.ReadingSubmission.user_id == user_id, models.ReadingSubmission.is_full_test_only == False)
            .order_by(models.ReadingSubmission.submitted_at.desc())
            .all()
        )
        
        return [
            schemas.SubmissionHistoryItem(
                id=sub.id, 
                test_id=sub.test_id, 
                test={"id": test.id, "title": test.title},
                status=sub.status,
                is_full_test_only=sub.is_full_test_only,
                band_score=sub.band_score, 
                correct_count=sub.correct_count,
                total_questions=40, 
                submitted_at=sub.submitted_at
            ) for sub, test in results
        ]

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        submission = db.query(models.ReadingSubmission).filter(models.ReadingSubmission.id == submission_id).first()
        if not submission: return None
        
        test = ReadingService.get_full_test_data(db, submission.test_id)
        
        all_questions = []
        if test:
             for passage in test.passages:
                for group in passage.groups:
                    all_questions.extend(group.questions)
        
        all_questions.sort(key=lambda x: x.question_number)

        detailed_results = []
        student_answers_map = submission.user_answers or {} 
        
        for q in all_questions:
            # 🔥 FIX TẬN GỐC TƯƠNG TỰ NHƯ HÀM SUBMIT
            q_num = str(q.question_number)
            student_ans = student_answers_map.get(q_num)
            
            is_correct = ReadingService.check_is_correct(student_ans, q.correct_answers)

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
    
    # ... (Các hàm Admin Management giữ nguyên như code của bạn)
    # =======================================================
    # 👑 ADMIN: SUBMISSION MANAGEMENT
    # =======================================================
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(models.ReadingSubmission).options(
            joinedload(models.ReadingSubmission.user),
            joinedload(models.ReadingSubmission.test)
        )
        
        if status_filter:
            query = query.filter(models.ReadingSubmission.status == status_filter)
            
        submissions = query.order_by(models.ReadingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        results = []
        for sub in submissions:
            results.append(
                schemas.AdminReadingSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title} if sub.test else None,
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    band_score=sub.band_score,
                    correct_count=sub.correct_count,
                    total_questions=40,
                    submitted_at=sub.submitted_at,
                    user_answers={}, 
                    results=[]      
                )
            )
        return results

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        submissions = db.query(models.ReadingSubmission).options(
            joinedload(models.ReadingSubmission.user),
            joinedload(models.ReadingSubmission.test)
        ).filter(
            models.ReadingSubmission.user_id == target_user_id
        ).order_by(models.ReadingSubmission.submitted_at.desc()).all()

        results = []
        for sub in submissions:
            results.append(
                schemas.AdminReadingSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title} if sub.test else None,
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    band_score=sub.band_score,
                    correct_count=sub.correct_count,
                    total_questions=40,
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]
                )
            )
        return results