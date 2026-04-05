from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.listening.models import (
    AptisListeningTest, 
    AptisListeningPart, 
    AptisListeningQuestionGroup, 
    AptisListeningQuestion, 
    AptisListeningSubmission
)
from app.modules.APTIS.listening import schemas

class AptisListeningTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.ListeningTestCreate):
        try:
            db_test = AptisListeningTest(
                title=test_in.title, 
                description=test_in.description, 
                time_limit=test_in.time_limit,
                is_published=test_in.is_published,
                is_full_test_only=test_in.is_full_test_only
            )
            db.add(db_test)
            db.flush() 

            if test_in.parts:
                for p_data in test_in.parts:
                    db_part = AptisListeningPart(
                        test_id=db_test.id,
                        title=p_data.title,
                        part_number=p_data.part_number
                    )
                    db.add(db_part)
                    db.flush()

                    if p_data.groups:
                        for g_data in p_data.groups:
                            db_group = AptisListeningQuestionGroup(
                                part_id=db_part.id,
                                instruction=g_data.instruction,
                                image_url=g_data.image_url,
                                order=g_data.order,
                                audio_url=g_data.audio_url, 
                                transcript=g_data.transcript 
                            )
                            db.add(db_group)
                            db.flush()

                            if g_data.questions:
                                for q_data in g_data.questions:
                                    db_question = AptisListeningQuestion(
                                        group_id=db_group.id,
                                        question_number=q_data.question_number,
                                        question_text=q_data.question_text,
                                        question_type=q_data.question_type,
                                        options=q_data.options,
                                        correct_answer=q_data.correct_answer,
                                        explanation=q_data.explanation,
                                        audio_url=q_data.audio_url
                                    )
                                    db.add(db_question)
            
            db.commit()
            return AptisListeningTestService.get_test_detail(db, db_test.id)
            
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.ListeningTestUpdate):
        test = db.query(AptisListeningTest).filter(AptisListeningTest.id == test_id).first()
        if not test: return None
        
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description 
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            db.query(AptisListeningPart).filter(AptisListeningPart.test_id == test_id).delete(synchronize_session=False)
            db.flush()

            for p_data in test_in.parts:
                db_part = AptisListeningPart(test_id=test.id, part_number=p_data.part_number)
                db.add(db_part)
                db.flush()

                if p_data.groups:
                    for g_data in p_data.groups:
                        db_group = AptisListeningQuestionGroup(
                            part_id=db_part.id,
                            instruction=g_data.instruction,
                            image_url=g_data.image_url,
                            order=g_data.order,
                            audio_url=g_data.audio_url,
                            transcript=g_data.transcript
                        )
                        db.add(db_group)
                        db.flush()

                        if g_data.questions:
                            for q_data in g_data.questions:
                                db_question = AptisListeningQuestion(
                                    group_id=db_group.id,
                                    question_number=q_data.question_number,
                                    question_text=q_data.question_text,
                                    question_type=q_data.question_type,
                                    options=q_data.options,
                                    correct_answer=q_data.correct_answer,
                                    explanation=q_data.explanation,
                                    audio_url=q_data.audio_url
                                )
                                db.add(db_question)

        db.commit()
        return AptisListeningTestService.get_test_detail(db, test.id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(AptisListeningTest).filter(AptisListeningTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(AptisListeningTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(AptisListeningTest.is_full_test_only == True)
            tests = query.order_by(AptisListeningTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.ListeningTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                AptisListeningTest.is_published == True,
                AptisListeningTest.is_full_test_only == False
            )
            tests = query.order_by(AptisListeningTest.created_at.desc()).offset(skip).limit(limit).all()
            
            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(AptisListeningSubmission).filter(
                        AptisListeningSubmission.test_id == test.id,
                        AptisListeningSubmission.user_id == current_user_id,
                        AptisListeningSubmission.is_full_test_only == False
                    ).order_by(AptisListeningSubmission.submitted_at.desc()).first()
                    
                    if latest_sub:
                        status_val = latest_sub.status
                
                test_dict = schemas.ListeningTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)
                
            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        test =  (
            db.query(AptisListeningTest)
            .options(
                joinedload(AptisListeningTest.parts)
                .joinedload(AptisListeningPart.groups)
                .joinedload(AptisListeningQuestionGroup.questions)
            )
            .filter(AptisListeningTest.id == test_id)
            .first()
        )
        if not test:
            return None
        return schemas.ListeningTestResponse.model_validate(test)