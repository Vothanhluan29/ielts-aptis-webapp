from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.IELTS.speaking.models import SpeakingTest, SpeakingPart, SpeakingQuestion, SpeakingSubmission
from app.modules.IELTS.speaking import schemas

class SpeakingTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.SpeakingTestCreate):
        db_test = SpeakingTest(
            title=test_in.title,
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.commit()
        db.refresh(db_test)

        for p in test_in.parts:
            db_part = SpeakingPart(
                test_id=db_test.id,
                part_number=p.part_number,
                instruction=p.instruction,
                cue_card=p.cue_card
            )
            db.add(db_part)
            db.flush() 

            for q in p.questions:
                db_q = SpeakingQuestion(
                    part_id=db_part.id,
                    question_text=q.question_text,
                    audio_question_url=q.audio_question_url,
                    sort_order=q.sort_order
                )
                db.add(db_q)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.SpeakingTestUpdate):
        test = db.query(SpeakingTest).filter(SpeakingTest.id == test_id).first()
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            old_parts = db.query(SpeakingPart).filter(SpeakingPart.test_id == test_id).all()
            for old_part in old_parts:
                db.delete(old_part)
            
            db.flush() 
            
            for p in test_in.parts:
                db_part = SpeakingPart(
                    test_id=test.id,
                    part_number=p.part_number,
                    instruction=p.instruction,
                    cue_card=p.cue_card
                )
                db.add(db_part)
                db.flush()

                for q in p.questions:
                    db_q = SpeakingQuestion(
                        part_id=db_part.id,
                        question_text=q.question_text,
                        audio_question_url=q.audio_question_url,
                        sort_order=q.sort_order
                    )
                    db.add(db_q)

        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(SpeakingTest).filter(SpeakingTest.id == test_id).first()
        if not test: return False
        try:
            db.query(SpeakingSubmission).filter(SpeakingSubmission.test_id == test_id).delete()
            db.delete(test)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(SpeakingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(SpeakingTest.is_full_test_only == True)
            tests = query.order_by(SpeakingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.SpeakingTestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                SpeakingTest.is_published == True, 
                SpeakingTest.is_full_test_only == False
            )
            tests = query.order_by(SpeakingTest.created_at.desc()).offset(skip).limit(limit).all()

            result_list = []
            for test in tests:
                status_val = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(SpeakingSubmission).filter(
                        SpeakingSubmission.test_id == test.id,
                        SpeakingSubmission.user_id == current_user_id,
                        SpeakingSubmission.is_full_test_only == False
                    ).order_by(SpeakingSubmission.submitted_at.desc()).first()

                    if latest_sub:
                        status_val = latest_sub.status

                test_dict = schemas.SpeakingTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)

            return result_list

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        return db.query(SpeakingTest).options(
            joinedload(SpeakingTest.parts).joinedload(SpeakingPart.questions)
        ).filter(SpeakingTest.id == test_id).first()