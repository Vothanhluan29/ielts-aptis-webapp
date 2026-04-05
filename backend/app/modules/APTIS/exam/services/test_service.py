from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.exam.models import AptisFullTest, AptisExamSubmission, AptisExamStatus, AptisExamStep
from app.modules.APTIS.exam import schemas

class AptisExamTestService:
    @staticmethod
    def get_all_full_tests(db: Session, current_user_id: Optional[int] = None, admin_view: bool = False):
        query = db.query(AptisFullTest).options(
            joinedload(AptisFullTest.grammar_vocab_test),
            joinedload(AptisFullTest.listening_test),
            joinedload(AptisFullTest.reading_test),
            joinedload(AptisFullTest.writing_test),
            joinedload(AptisFullTest.speaking_test)
        )
        
        if not admin_view:
            query = query.filter(AptisFullTest.is_published == True)

        tests = query.order_by(AptisFullTest.created_at.desc()).all()
        result_list = []
        
        for test in tests:
            user_status = AptisExamStatus.NOT_STARTED.value
            current_step = AptisExamStep.NOT_STARTED.value
            exam_submission_id = None

            if current_user_id:
                latest_sub = db.query(AptisExamSubmission).filter(
                    AptisExamSubmission.full_test_id == test.id,
                    AptisExamSubmission.user_id == current_user_id
                ).order_by(AptisExamSubmission.start_time.desc()).first()

                if latest_sub:
                    user_status = latest_sub.status
                    current_step = latest_sub.current_step
                    exam_submission_id = latest_sub.id

            result_list.append(schemas.AptisFullTestListItem(
                id=test.id,
                title=test.title,
                description=test.description,
                is_published=test.is_published,
                created_at=test.created_at,
                user_status=user_status,
                current_step=current_step,
                exam_submission_id=exam_submission_id,
                grammar_vocab_test=test.grammar_vocab_test,
                listening_test=test.listening_test,
                reading_test=test.reading_test,
                writing_test=test.writing_test,
                speaking_test=test.speaking_test
            ))

        return result_list

    @staticmethod
    def get_full_test_detail(db: Session, test_id: int):
        return db.query(AptisFullTest).options(
            joinedload(AptisFullTest.grammar_vocab_test),
            joinedload(AptisFullTest.listening_test),
            joinedload(AptisFullTest.reading_test),
            joinedload(AptisFullTest.writing_test),
            joinedload(AptisFullTest.speaking_test),
        ).filter(AptisFullTest.id == test_id).first()

    @staticmethod
    def create_full_test(db: Session, data: schemas.AptisFullTestCreate):
        full_test = AptisFullTest(**data.model_dump())
        db.add(full_test)
        db.commit()
        db.refresh(full_test)
        return full_test

    @staticmethod
    def update_full_test(db: Session, test_id: int, data: schemas.AptisFullTestUpdate):
        test = db.query(AptisFullTest).options(
            joinedload(AptisFullTest.grammar_vocab_test),
            joinedload(AptisFullTest.listening_test),
            joinedload(AptisFullTest.reading_test),
            joinedload(AptisFullTest.writing_test),
            joinedload(AptisFullTest.speaking_test)
        ).filter(AptisFullTest.id == test_id).first()
        
        if not test: return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(test, key, value)
            
        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def delete_full_test(db: Session, test_id: int):
        test = db.query(AptisFullTest).filter(AptisFullTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True