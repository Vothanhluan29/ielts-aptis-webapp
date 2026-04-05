from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import Optional

from app.modules.APTIS.grammar_vocab import schemas, models

class GrammarVocabTestService:
    @staticmethod
    def create_test(db: Session, test_data: schemas.TestCreate) -> models.AptisGrammarVocabTest:
        db_test = models.AptisGrammarVocabTest(
            title=test_data.title,
            description=test_data.description,
            time_limit=test_data.time_limit,
            is_published=test_data.is_published,
            is_full_test_only=test_data.is_full_test_only
        )
        db.add(db_test)
        db.flush() 

        if test_data.questions:
            db_questions = [
                models.AptisGrammarVocabQuestion(
                    test_id=db_test.id,
                    **q.model_dump()
                )
                for q in test_data.questions
            ]
            db.add_all(db_questions)

        db.commit()
        return GrammarVocabTestService.get_test_detail_admin(db, db_test.id)

    @staticmethod
    def update_test(db: Session, test_id: int, test_data: schemas.TestUpdate) -> models.AptisGrammarVocabTest:
        test = GrammarVocabTestService.get_test_detail_admin(db, test_id)

        update_data = test_data.model_dump(exclude_unset=True, exclude={"questions"})
        for key, value in update_data.items():
            setattr(test, key, value)

        if test_data.description is not None:
            test.description = test_data.description

        if test_data.questions is not None:
            db.query(models.AptisGrammarVocabQuestion).filter(
                models.AptisGrammarVocabQuestion.test_id == test_id
            ).delete(synchronize_session=False)
            
            db.flush() 
            
            for q in test_data.questions:
                db_q = models.AptisGrammarVocabQuestion(
                    test_id=test_id,
                    **q.model_dump()
                )
                db.add(db_q)

        db.commit()
        return GrammarVocabTestService.get_test_detail_admin(db, test_id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = GrammarVocabTestService.get_test_detail_admin(db, test_id)
        db.delete(test)
        db.commit()
        return {"message": "Test deleted successfully"}

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(models.AptisGrammarVocabTest)

        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.AptisGrammarVocabTest.is_full_test_only == True)
        else:
            query = query.filter(
                models.AptisGrammarVocabTest.is_published == True,
                models.AptisGrammarVocabTest.is_full_test_only == False
            )

        tests = query.order_by(models.AptisGrammarVocabTest.created_at.desc()).offset(skip).limit(limit).all()

        result_list = []
        for test in tests:
            status_val = models.AptisGrammarVocabStatus.NOT_STARTED
            
            if current_user_id:
                latest_sub = db.query(models.AptisGrammarVocabSubmission).filter(
                    models.AptisGrammarVocabSubmission.test_id == test.id,
                    models.AptisGrammarVocabSubmission.user_id == current_user_id,
                    models.AptisGrammarVocabSubmission.is_full_test_only == False
                ).order_by(models.AptisGrammarVocabSubmission.submitted_at.desc()).first()

                if latest_sub:
                    status_val = latest_sub.status 

            test_dict = schemas.TestListItem.model_validate(test).model_dump()
            test_dict['status'] = status_val
            result_list.append(test_dict)

        return result_list

    @staticmethod
    def get_test_detail_admin(db: Session, test_id: int) -> models.AptisGrammarVocabTest:
        test = (
            db.query(models.AptisGrammarVocabTest)
            .options(joinedload(models.AptisGrammarVocabTest.questions))
            .filter(models.AptisGrammarVocabTest.id == test_id)
            .first()
        )
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
        return test

    @staticmethod
    def get_test_for_user(db: Session, test_id: int) -> models.AptisGrammarVocabTest:
        test = (
            db.query(models.AptisGrammarVocabTest)
            .options(joinedload(models.AptisGrammarVocabTest.questions))
            .filter(
                models.AptisGrammarVocabTest.id == test_id,
                models.AptisGrammarVocabTest.is_published == True
            )
            .first()
        )
        if not test:
            raise HTTPException(status_code=404, detail="Test not found or not published")
        return test