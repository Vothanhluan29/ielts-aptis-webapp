from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime

from app.modules.APTIS.grammar_vocab import schemas, models
from .utils import GrammarVocabUtils

class GrammarVocabSubmissionService:
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.SubmissionCreate) -> models.AptisGrammarVocabSubmission:
        test = (
            db.query(models.AptisGrammarVocabTest)
            .options(joinedload(models.AptisGrammarVocabTest.groups)
                     .joinedload(models.AptisGrammarVocabGroup.questions))
            .filter(models.AptisGrammarVocabTest.id == submission_data.test_id)
            .first()
        )
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        grammar_score = 0
        vocab_score = 0
        answer_details = {}

        for group in test.groups:
            part_type_val = group.part_type.value if hasattr(group.part_type, 'value') else str(group.part_type)
            
            for question in group.questions:
                q_id = str(question.id)
                q_num = str(question.question_number)

                user_choice = submission_data.user_answers.get(q_id)
                if user_choice is None:
                    user_choice = submission_data.user_answers.get(q_num)
                
                is_correct = False

               
                if user_choice is not None and question.correct_answer is not None:
                    user_key_str = str(user_choice).strip().upper()
                    correct_raw_str = str(question.correct_answer).strip().upper()

                    if user_key_str == correct_raw_str:
                        is_correct = True
                    else:
                        raw_options = question.options 
                        options = GrammarVocabUtils.parse_options(raw_options)
                        
                        if isinstance(options, dict):
                            mapped_value = options.get(user_choice) or options.get(user_key_str)
                            if mapped_value and str(mapped_value).strip().upper() == correct_raw_str:
                                is_correct = True
                            elif user_key_str in [str(v).strip().upper() for v in options.values()]:
                                if user_key_str == correct_raw_str:
                                    is_correct = True

                if is_correct:
                    if "GRAMMAR" in part_type_val.upper():
                        grammar_score += 1
                    else:
                        vocab_score += 1

                answer_details[q_id] = {
                    "question_id": question.id,
                    "group_id": group.id,
                    "part_type": part_type_val,
                    "user_choice": user_choice,
                    "correct_answer": question.correct_answer,
                    "is_correct": is_correct,
                    "explanation": question.explanation,
                }

        total_score = grammar_score + vocab_score

        db_submission = models.AptisGrammarVocabSubmission(
            user_id=user_id,
            test_id=test.id,
            grammar_score=grammar_score,
            vocab_score=vocab_score,
            total_score=total_score,
            status=models.AptisGrammarVocabStatus.GRADED, 
            is_full_test_only=submission_data.is_full_test_only, 
            user_answers=submission_data.user_answers,
            answer_details=answer_details,
            submitted_at=datetime.now()
        )

        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)

        return db_submission

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(models.AptisGrammarVocabSubmission).options(
            joinedload(models.AptisGrammarVocabSubmission.test)
        ).filter(
            models.AptisGrammarVocabSubmission.user_id == user_id, 
            models.AptisGrammarVocabSubmission.is_full_test_only == False
        ).order_by(models.AptisGrammarVocabSubmission.submitted_at.desc()).all()
    
    @staticmethod
    def get_submission_detail(db: Session, sub_id: int):
        return db.query(models.AptisGrammarVocabSubmission).options(
            joinedload(models.AptisGrammarVocabSubmission.test)
            .joinedload(models.AptisGrammarVocabTest.groups)
            .joinedload(models.AptisGrammarVocabGroup.questions)
        ).filter(models.AptisGrammarVocabSubmission.id == sub_id).first()