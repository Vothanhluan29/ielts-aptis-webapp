from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.modules.APTIS.reading import models, schemas
from .utils import AptisReadingUtils
from .test_service import AptisReadingTestService

class AptisReadingSubmissionService:
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.StudentSubmissionRequest):
        test = AptisReadingTestService.get_full_test_data(db, submission_data.test_id)
        if not test: return None

        all_questions = []
        for part in test.parts:
            for group in part.groups:
                all_questions.extend(group.questions)

        all_questions.sort(key=lambda x: x.question_number)
        correct_count = 0
        answers_to_store = submission_data.answers or {}
        detailed_results = []
        
        for q in all_questions:
            q_id_str = str(q.id)
            q_num_str = str(q.question_number)
            user_ans = answers_to_store.get(q_id_str)
            if user_ans is None:
                user_ans = answers_to_store.get(q_num_str, "")
            
            cleaned_student = AptisReadingUtils.clean_text(user_ans)
            cleaned_correct = AptisReadingUtils.clean_text(q.correct_answer)
            
            accepted_answers = [ans.strip() for ans in cleaned_correct.replace('|', '/').split('/')]
            is_correct = cleaned_student in accepted_answers

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

        scoring_result = AptisReadingUtils.calculate_aptis_score_and_cefr(correct_count, len(all_questions))
        
        db_submission = models.AptisReadingSubmission(
            user_id=user_id,
            test_id=test.id,
            user_answers=answers_to_store,
            correct_count=correct_count,
            score=scoring_result["score"],
            cefr_level=scoring_result["cefr_level"],
            submitted_at=datetime.now(),
            status=models.AptisReadingStatus.GRADED.value,
            is_full_test_only=submission_data.is_full_test_only
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
            total_questions=len(all_questions),
            
            submitted_at=db_submission.submitted_at,
            user_answers=db_submission.user_answers,
            results=detailed_results
        )

    @staticmethod
    def get_student_history(db: Session, user_id: int):
        results = (
            db.query(models.AptisReadingSubmission, models.AptisReadingTest)
            .join(models.AptisReadingTest, models.AptisReadingSubmission.test_id == models.AptisReadingTest.id)
            .filter(models.AptisReadingSubmission.user_id == user_id, models.AptisReadingSubmission.is_full_test_only == False)
            .order_by(models.AptisReadingSubmission.submitted_at.desc())
            .all()
        )
        
        return [
            schemas.SubmissionHistoryItem(
                id=sub.id, 
                test_id=sub.test_id, 
                test={"id": test.id, "title": test.title, "description": test.description}, 
                status=sub.status,
                is_full_test_only=sub.is_full_test_only,
                
                correct_count=sub.correct_count,
                score=sub.score,
                cefr_level=sub.cefr_level,
                total_questions=25, 
                
                submitted_at=sub.submitted_at
            ) for sub, test in results
        ]

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        submission = db.query(models.AptisReadingSubmission).filter(models.AptisReadingSubmission.id == submission_id).first()
        if not submission: return None
        
        test = AptisReadingTestService.get_full_test_data(db, submission.test_id)
        
        all_questions = []
        if test:
             for part in test.parts:
                for group in part.groups:
                    all_questions.extend(group.questions)
        
        all_questions.sort(key=lambda x: x.question_number)

        detailed_results = []
        student_answers_map = submission.user_answers or {} 
        
        for q in all_questions:
            q_id = str(q.id)
            q_num = str(q.question_number)
            student_ans = student_answers_map.get(q_id)
            if student_ans is None:
                student_ans = student_answers_map.get(q_num, "")
            
            cleaned_student = AptisReadingUtils.clean_text(student_ans)
            cleaned_correct = AptisReadingUtils.clean_text(q.correct_answer)
            accepted_answers = [a.strip() for a in cleaned_correct.replace('|', '/').split('/')]
            is_correct = cleaned_student in accepted_answers

            detailed_results.append({
                "id": q.id,
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": student_ans,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation
            })
            
        return schemas.SubmissionDetail(
            id=submission.id,
            test_id=submission.test_id,
            test={"id": test.id, "title": test.title, "description": test.description} if test else None, 
            user_id=submission.user_id,
            status=submission.status,
            is_full_test_only=submission.is_full_test_only,
            
            correct_count=submission.correct_count,
            score=submission.score,
            cefr_level=submission.cefr_level,
            total_questions=len(all_questions),
            
            submitted_at=submission.submitted_at,
            user_answers=submission.user_answers,
            results=detailed_results 
        )
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(models.AptisReadingSubmission).options(
            joinedload(models.AptisReadingSubmission.user),
            joinedload(models.AptisReadingSubmission.test)
        )
        if status_filter:
            query = query.filter(models.AptisReadingSubmission.status == status_filter)
            
        submissions = query.order_by(models.AptisReadingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        results = []
        for sub in submissions:
            results.append(
                schemas.AdminReadingSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, 
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    
                    correct_count=sub.correct_count,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    total_questions=25,
                    
                    submitted_at=sub.submitted_at,
                    user_answers={}, 
                    results=[]      
                )
            )
        return results

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        submissions = db.query(models.AptisReadingSubmission).options(
            joinedload(models.AptisReadingSubmission.user),
            joinedload(models.AptisReadingSubmission.test)
        ).filter(
            models.AptisReadingSubmission.user_id == target_user_id
        ).order_by(models.AptisReadingSubmission.submitted_at.desc()).all()

        results = []
        for sub in submissions:
            results.append(
                schemas.AdminReadingSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, 
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    
                    correct_count=sub.correct_count,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    total_questions=25,
                    
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]
                )
            )
        return results