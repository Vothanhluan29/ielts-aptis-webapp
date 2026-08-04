from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.exam.models import AptisFullTest, AptisExamSubmission, AptisExamStatus, AptisExamStep
from app.modules.APTIS.exam import schemas

class AptisExamTestService:
    @staticmethod
    def get_all_full_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False):
        query = db.query(AptisFullTest).options(
            joinedload(AptisFullTest.grammar_vocab_test),
            joinedload(AptisFullTest.listening_test),
            joinedload(AptisFullTest.reading_test),
            joinedload(AptisFullTest.writing_test),
            joinedload(AptisFullTest.speaking_test)
        )
        
        if not admin_view:
            query = query.filter(AptisFullTest.is_published == True)

        total = query.count()
        tests = query.order_by(AptisFullTest.created_at.desc()).offset(skip).limit(limit).all()
        
        sub_status_map = {}
        if current_user_id and tests:
            test_ids = [t.id for t in tests]
            user_subs = db.query(AptisExamSubmission).filter(
                AptisExamSubmission.user_id == current_user_id,
                AptisExamSubmission.full_test_id.in_(test_ids)
            ).all()
            
            # Group by test_id, taking the one with max start_time
            status_map = {}
            for sub in user_subs:
                if sub.full_test_id not in status_map:
                    status_map[sub.full_test_id] = sub
                else:
                    if sub.start_time > status_map[sub.full_test_id].start_time:
                        status_map[sub.full_test_id] = sub
                        
            for tid, sub in status_map.items():
                sub_status_map[tid] = {
                    "user_status": sub.status,
                    "current_step": sub.current_step,
                    "exam_submission_id": sub.id
                }

        result_list = []
        for test in tests:
            sub_info = sub_status_map.get(test.id, {
                "user_status": AptisExamStatus.NOT_STARTED.value,
                "current_step": AptisExamStep.NOT_STARTED.value,
                "exam_submission_id": None
            })

            result_list.append(schemas.AptisFullTestListItem(
                id=test.id,
                title=test.title,
                description=test.description,
                is_published=test.is_published,
                created_at=test.created_at,
                user_status=sub_info["user_status"],
                current_step=sub_info["current_step"],
                exam_submission_id=sub_info["exam_submission_id"],
                grammar_vocab_test=test.grammar_vocab_test,
                listening_test=test.listening_test,
                reading_test=test.reading_test,
                writing_test=test.writing_test,
                speaking_test=test.speaking_test
            ))

        return {"items": result_list, "total": total}

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