from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.writing.models import (
    AptisWritingTest, AptisWritingPart, AptisWritingQuestion, 
    AptisWritingSubmission
)
from app.modules.APTIS.writing import schemas

class AptisWritingTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.WritingTestCreate):
        db_test = AptisWritingTest(
            title=test_in.title, 
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.flush() 
        
        for p in test_in.parts:
            db_part = AptisWritingPart(
                test_id=db_test.id,
                part_number=p.part_number,
                part_type=p.part_type,
                instruction=p.instruction,
            )
            db.add(db_part)
            db.flush() 
            
            for q in p.questions:
                db_q = AptisWritingQuestion(
                    part_id=db_part.id,
                    question_text=q.question_text,
                    order_number=q.order_number,
                    sub_type=q.sub_type
                )
                db.add(db_q)
        
        db.commit()
        return AptisWritingTestService.get_test_detail(db, db_test.id)

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.WritingTestUpdate):
        test = db.query(AptisWritingTest).options(
            joinedload(AptisWritingTest.parts).joinedload(AptisWritingPart.questions)
        ).filter(AptisWritingTest.id == test_id).first()
        
        if not test: return None
        
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            test.parts = [] 
            db.flush()

            new_parts = []
            for p in test_in.parts:
                db_part = AptisWritingPart(
                    part_number=p.part_number,
                    part_type=p.part_type,
                    instruction=p.instruction,
                )
                
                new_questions = [
                    AptisWritingQuestion(
                        question_text=q.question_text,
                        order_number=q.order_number,
                        sub_type=q.sub_type
                    ) for q in p.questions
                ]
                db_part.questions = new_questions
                new_parts.append(db_part)
            
            test.parts = new_parts

        db.commit()
        return AptisWritingTestService.get_test_detail(db, test.id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(AptisWritingTest).filter(AptisWritingTest.id == test_id).first()
        if not test: return False
        
        try:
            db.delete(test) 
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(AptisWritingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(AptisWritingTest.is_full_test_only == True)
            tests = query.order_by(AptisWritingTest.created_at.desc()).offset(skip).limit(limit).all()
            return tests
        else:
            query = query.filter(
                AptisWritingTest.is_published == True,
                AptisWritingTest.is_full_test_only == False
            )
            tests = query.order_by(AptisWritingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(AptisWritingSubmission).filter(
                        AptisWritingSubmission.test_id == test.id,
                        AptisWritingSubmission.user_id == current_user_id,
                        AptisWritingSubmission.is_full_test_only == False
                    ).order_by(AptisWritingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = {
                    "id": test.id,
                    "title": test.title,
                    "time_limit": test.time_limit,
                    "description": test.description,
                    "is_published": test.is_published,
                    "is_full_test_only": test.is_full_test_only,
                    "created_at": test.created_at,
                    "status": status_val
                }
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        test = db.query(AptisWritingTest).options(
            joinedload(AptisWritingTest.parts).joinedload(AptisWritingPart.questions)
        ).filter(AptisWritingTest.id == test_id).first()
        if not test: 
            return None
        return schemas.WritingTestResponse.model_validate(test)