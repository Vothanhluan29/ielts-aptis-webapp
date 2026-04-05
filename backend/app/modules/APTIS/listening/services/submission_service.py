import json
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.listening.models import (
    AptisListeningTest, 
    AptisListeningPart, 
    AptisListeningQuestionGroup, 
    AptisListeningQuestion, 
    AptisListeningSubmission,
    AptisListeningStatus
)
from app.modules.APTIS.listening import schemas
from .utils import AptisListeningUtils

class AptisListeningSubmissionService:
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
            
            norm_user = AptisListeningUtils.normalize_answer(actual_ans)
            norm_correct = AptisListeningUtils.normalize_answer(q.correct_answer)
            
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
        
        scoring_result = AptisListeningUtils.calculate_aptis_score_and_cefr(correct_count, len(questions))

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
            
            norm_user = AptisListeningUtils.normalize_answer(actual_ans)
            norm_correct = AptisListeningUtils.normalize_answer(q.correct_answer)
            
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