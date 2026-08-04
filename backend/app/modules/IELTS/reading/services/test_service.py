from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.modules.IELTS.reading import models, schemas

class ReadingTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.TestCreateOrUpdate):
        db_test = models.ReadingTest(
            title=test_in.title, 
            time_limit=test_in.time_limit,
            description=test_in.description,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only 
        )
        db.add(db_test)
        db.flush() 

        for p_data in test_in.passages:
            db_passage = models.ReadingPassage(
                test_id=db_test.id,
                title=p_data.title,
                content=p_data.content,
                order=p_data.order
            )
            db.add(db_passage)
            db.flush()

            for g_data in p_data.groups:
                db_group = models.ReadingQuestionGroup(
                    passage_id=db_passage.id,
                    instruction=g_data.instruction,
                    image_url=g_data.image_url,
                    order=g_data.order
                )
                db.add(db_group)
                db.flush()

                for q_data in g_data.questions:
                    db_question = models.ReadingQuestion(
                        group_id=db_group.id,
                        question_number=q_data.question_number,
                        question_text=q_data.question_text,
                        question_type=q_data.question_type,
                        options=q_data.options,
                        correct_answers=q_data.correct_answers, 
                        explanation=q_data.explanation
                    )
                    db.add(db_question)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.TestCreateOrUpdate):
        test = db.query(models.ReadingTest).options(
            joinedload(models.ReadingTest.passages)
        ).filter(models.ReadingTest.id == test_id).first()
        
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.description is not None: test.description = test_in.description
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.passages is not None:
            test.passages = [] 
            db.flush() 

            new_passages = []
            for p_data in test_in.passages:
                db_passage = models.ReadingPassage(
                    title=p_data.title,
                    content=p_data.content,
                    order=p_data.order
                )

                for g_data in p_data.groups:
                    db_group = models.ReadingQuestionGroup(
                        instruction=g_data.instruction,
                        image_url=g_data.image_url,
                        order=g_data.order
                    )

                    for q_data in g_data.questions:
                        db_question = models.ReadingQuestion(
                            question_number=q_data.question_number,
                            question_text=q_data.question_text,
                            question_type=q_data.question_type,
                            options=q_data.options,
                            correct_answers=q_data.correct_answers, 
                            explanation=q_data.explanation
                        )
                        db_group.questions.append(db_question)

                    db_passage.groups.append(db_group)
                
                new_passages.append(db_passage)

            test.passages = new_passages

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(models.ReadingTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.ReadingTest.is_full_test_only == True)
            total = query.count()
            tests = query.order_by(models.ReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            return {"items": [schemas.TestListItem.model_validate(t) for t in tests], "total": total}
        else:
            query = query.filter(
                models.ReadingTest.is_published == True,
                models.ReadingTest.is_full_test_only == False 
            )
            total = query.count()
            tests = query.order_by(models.ReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            
            sub_status_map = {}
            if current_user_id and tests:
                test_ids = [t.id for t in tests]
                user_subs = db.query(models.ReadingSubmission).filter(
                    models.ReadingSubmission.user_id == current_user_id,
                    models.ReadingSubmission.test_id.in_(test_ids),
                    models.ReadingSubmission.is_full_test_only == False
                ).all()
                
                status_map = {}
                for sub in user_subs:
                    if sub.test_id not in status_map:
                        status_map[sub.test_id] = sub
                    else:
                        if sub.submitted_at > status_map[sub.test_id].submitted_at:
                            status_map[sub.test_id] = sub
                
                for tid, sub in status_map.items():
                    sub_status_map[tid] = sub.status

            result_list = []
            for test in tests:
                status = sub_status_map.get(test.id, "NOT_STARTED")
                test_dict = schemas.TestListItem.model_validate(test).model_dump()
                test_dict['status'] = status
                result_list.append(test_dict)
                
            return {"items": result_list, "total": total}

    @staticmethod
    def get_full_test_data(db: Session, test_id: int):
        return db.query(models.ReadingTest).options(
            joinedload(models.ReadingTest.passages)
            .joinedload(models.ReadingPassage.groups)
            .joinedload(models.ReadingQuestionGroup.questions)
        ).filter(models.ReadingTest.id == test_id).first()
    
    get_test_detail = get_full_test_data

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(models.ReadingTest).filter(models.ReadingTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True