from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.reading import models, schemas

class AptisReadingTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.TestCreateOrUpdate):
        db_test = models.AptisReadingTest(
            title=test_in.title, 
            description=test_in.description, 
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only 
        )
        db.add(db_test)
        db.flush() 

        for p_data in test_in.parts:
            db_part = models.AptisReadingPart(
                test_id=db_test.id,
                part_number=p_data.part_number,
                title=p_data.title,
                content=p_data.content 
            )
            db.add(db_part)
            db.flush()

            for g_data in p_data.groups:
                db_group = models.AptisReadingQuestionGroup(
                    part_id=db_part.id,
                    instruction=g_data.instruction,
                    image_url=g_data.image_url,
                    order=g_data.order
                )
                db.add(db_group)
                db.flush()

                for q_data in g_data.questions:
                    db_question = models.AptisReadingQuestion(
                        group_id=db_group.id,
                        question_number=q_data.question_number,
                        question_text=q_data.question_text,
                        question_type=q_data.question_type,
                        options=q_data.options,
                        correct_answer=q_data.correct_answer,
                        explanation=q_data.explanation
                    )
                    db.add(db_question)
        
        db.commit()
        return AptisReadingTestService.get_full_test_data(db, db_test.id) 

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.TestCreateOrUpdate):
        test = db.query(models.AptisReadingTest).options(
            joinedload(models.AptisReadingTest.parts)
        ).filter(models.AptisReadingTest.id == test_id).first()
        
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
            for p_data in test_in.parts:
                db_part = models.AptisReadingPart(
                    part_number=p_data.part_number,
                    title=p_data.title,
                    content=p_data.content
                )

                for g_data in p_data.groups:
                    db_group = models.AptisReadingQuestionGroup(
                        instruction=g_data.instruction,
                        image_url=g_data.image_url,
                        order=g_data.order
                    )

                    for q_data in g_data.questions:
                        db_question = models.AptisReadingQuestion(
                            question_number=q_data.question_number,
                            question_text=q_data.question_text,
                            question_type=q_data.question_type,
                            options=q_data.options,
                            correct_answer=q_data.correct_answer,
                            explanation=q_data.explanation
                        )
                        db_group.questions.append(db_question) 

                    db_part.groups.append(db_group) 
                
                new_parts.append(db_part)

            test.parts = new_parts

        db.commit()
        return AptisReadingTestService.get_full_test_data(db, test.id)

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(models.AptisReadingTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.AptisReadingTest.is_full_test_only == True)
            tests = query.order_by(models.AptisReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.TestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                models.AptisReadingTest.is_published == True,
                models.AptisReadingTest.is_full_test_only == False 
            )
            tests = query.order_by(models.AptisReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            
            result_list = []
            for test in tests:
                status = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(models.AptisReadingSubmission).filter(
                        models.AptisReadingSubmission.test_id == test.id,
                        models.AptisReadingSubmission.user_id == current_user_id,
                        models.AptisReadingSubmission.is_full_test_only == False
                    ).order_by(models.AptisReadingSubmission.submitted_at.desc()).first()
                    
                    if latest_sub:
                        status = latest_sub.status
                
                test_dict = schemas.TestListItem.model_validate(test).model_dump()
                test_dict['status'] = status
                result_list.append(test_dict)
                
            return result_list

    @staticmethod
    def get_full_test_data(db: Session, test_id: int):
        return db.query(models.AptisReadingTest).options(
            joinedload(models.AptisReadingTest.parts)
            .joinedload(models.AptisReadingPart.groups)
            .joinedload(models.AptisReadingQuestionGroup.questions)
        ).filter(models.AptisReadingTest.id == test_id).first()
    
    get_test_detail = get_full_test_data

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(models.AptisReadingTest).filter(models.AptisReadingTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True