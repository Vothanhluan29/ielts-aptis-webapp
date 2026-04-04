from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.modules.IELTS.reading import models, schemas
from .utils import ReadingUtils
from .test_service import ReadingTestService

class ReadingSubmissionService:
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.StudentSubmissionRequest):
        test = ReadingTestService.get_full_test_data(db, submission_data.test_id)
        if not test: return None

        all_questions = []
        for passage in test.passages:
            for group in passage.groups:
                all_questions.extend(group.questions)

        correct_count = 0
        answers_to_store = submission_data.user_answers or {} 
        detailed_results = []
        
        for q in all_questions:
            q_num_str = str(q.question_number)
            user_ans = answers_to_store.get(q_num_str)
            
            is_correct = ReadingUtils.check_is_correct(user_ans, q.correct_answers)

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

        band_score = ReadingUtils.calculate_ielts_band(correct_count)
        
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
        
        test = ReadingTestService.get_full_test_data(db, submission.test_id)
        
        all_questions = []
        if test:
             for passage in test.passages:
                for group in passage.groups:
                    all_questions.extend(group.questions)
        
        all_questions.sort(key=lambda x: x.question_number)

        detailed_results = []
        student_answers_map = submission.user_answers or {} 
        
        for q in all_questions:
            q_num = str(q.question_number)
            student_ans = student_answers_map.get(q_num)
            
            is_correct = ReadingUtils.check_is_correct(student_ans, q.correct_answers)

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