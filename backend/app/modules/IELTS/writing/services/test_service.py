from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import Optional

from app.modules.IELTS.writing.models import WritingTest, WritingTask, WritingSubmission
from app.modules.IELTS.writing import schemas

class WritingTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.WritingTestCreate):
        db_test = WritingTest(
            title=test_in.title, 
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
        
        for t in test_in.tasks:
            db_task = WritingTask(
                test_id=db_test.id,
                task_type=t.task_type,
                question_text=t.question_text,
                image_url=t.image_url,
            )
            db.add(db_task)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.WritingTestUpdate):
        test = db.query(WritingTest).filter(WritingTest.id == test_id).first()
        if not test: return None
        
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.tasks is not None:
            db.query(WritingTask).filter(WritingTask.test_id == test_id).delete()
            for t in test_in.tasks:
                db_task = WritingTask(
                    test_id=test.id,
                    task_type=t.task_type,
                    question_text=t.question_text,
                    image_url=t.image_url,
                )
                db.add(db_task)

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(WritingTest).filter(WritingTest.id == test_id).first()
        if not test: return False
        
        try:
            db.delete(test)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(WritingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(WritingTest.is_full_test_only == True)
            tests = query.order_by(WritingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.WritingTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                WritingTest.is_published == True,
                WritingTest.is_full_test_only == False
            )
            tests = query.order_by(WritingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(WritingSubmission).filter(
                        WritingSubmission.test_id == test.id,
                        WritingSubmission.user_id == current_user_id,
                        WritingSubmission.is_full_test_only == False
                    ).order_by(WritingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = schemas.WritingTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        return db.query(WritingTest).options(joinedload(WritingTest.tasks)).filter(WritingTest.id == test_id).first()