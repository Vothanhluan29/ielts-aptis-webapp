from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.modules.APTIS.speaking.models import (
    AptisSpeakingTest, AptisSpeakingPart, AptisSpeakingQuestion, AptisSpeakingSubmission
)
from app.modules.APTIS.speaking import schemas

class AptisSpeakingTestService:
    @staticmethod
    def create_test(db: Session, test_in: schemas.AptisSpeakingTestCreate):
        db_test = AptisSpeakingTest(
            title=test_in.title,
            description=test_in.description,
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            difficulty_level=test_in.difficulty_level,
            is_full_test_only=test_in.is_full_test_only
        )
        db.add(db_test)
        db.flush() 

        if test_in.parts:
            for p in test_in.parts:
                db_part = AptisSpeakingPart(
                    test_id=db_test.id,
                    part_number=p.part_number,
                    part_type=p.part_type,
                    instruction=p.instruction,
                    image_url=p.image_url,
                    image_url_2=p.image_url_2
                )
                db.add(db_part)
                db.flush() 

                for q in p.questions:
                    db_q = AptisSpeakingQuestion(
                        part_id=db_part.id,
                        order_number=q.order_number,
                        question_text=q.question_text,
                        audio_url=q.audio_url,
                        prep_time=q.prep_time,
                        response_time=q.response_time
                    )
                    db.add(db_q)
        
        db.commit()
        return AptisSpeakingTestService.get_test_detail(db, db_test.id)

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.AptisSpeakingTestUpdate):
        test = db.query(AptisSpeakingTest).filter(AptisSpeakingTest.id == test_id).first()
        if not test: return None

        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        if test_in.parts is not None:
            # Delete related questions first to avoid ForeignKeyViolation
            existing_parts = db.query(AptisSpeakingPart).filter(AptisSpeakingPart.test_id == test_id).all()
            part_ids = [p.id for p in existing_parts]
            if part_ids:
                db.query(AptisSpeakingQuestion).filter(AptisSpeakingQuestion.part_id.in_(part_ids)).delete(synchronize_session=False)
            
            db.query(AptisSpeakingPart).filter(AptisSpeakingPart.test_id == test_id).delete(synchronize_session=False)
            db.flush()
            for p in test_in.parts:
                db_part = AptisSpeakingPart(
                    test_id=test.id,
                    part_number=p.part_number,
                    part_type=p.part_type,
                    instruction=p.instruction,
                    image_url=p.image_url,
                    image_url_2=p.image_url_2
                )
                db.add(db_part)
                db.flush()

                for q in p.questions:
                    db_q = AptisSpeakingQuestion(
                        part_id=db_part.id,
                        order_number=q.order_number,
                        question_text=q.question_text,
                        audio_url=q.audio_url,
                        prep_time=q.prep_time,
                        response_time=q.response_time
                    )
                    db.add(db_q)

        db.commit()
        return AptisSpeakingTestService.get_test_detail(db, test.id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(AptisSpeakingTest).filter(AptisSpeakingTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    @staticmethod
    def get_all_tests(
        db: Session, 
        current_user_id: Optional[int] = None, 
        skip: int = 0, limit: int = 100, 
        admin_view: bool = False, fetch_mock_only: bool = False
    ):
        query = db.query(AptisSpeakingTest)
        if admin_view:
            if fetch_mock_only:
                query = query.filter(AptisSpeakingTest.is_full_test_only == True)
            total = query.count()
            tests = query.order_by(AptisSpeakingTest.created_at.desc()).offset(skip).limit(limit).all()
            return {"items": [schemas.AptisSpeakingTestListItem.model_validate(t) for t in tests], "total": total}
        else:
            query = query.filter(
                AptisSpeakingTest.is_published == True, 
                AptisSpeakingTest.is_full_test_only == False
            )
            total = query.count()
            tests = query.order_by(AptisSpeakingTest.created_at.desc()).offset(skip).limit(limit).all()

            sub_status_map = {}
            if current_user_id and tests:
                test_ids = [t.id for t in tests]
                user_subs = db.query(AptisSpeakingSubmission).filter(
                    AptisSpeakingSubmission.user_id == current_user_id,
                    AptisSpeakingSubmission.test_id.in_(test_ids),
                    AptisSpeakingSubmission.is_full_test_only == False
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
                status_val = sub_status_map.get(test.id, "NOT_STARTED")
                test_dict = schemas.AptisSpeakingTestListItem.model_validate(test).model_dump()
                test_dict['status'] = status_val
                result_list.append(test_dict)

            return {"items": result_list, "total": total}

    @staticmethod
    def get_test_detail(db: Session, test_id: int):
        return db.query(AptisSpeakingTest).options(
            joinedload(AptisSpeakingTest.parts).joinedload(AptisSpeakingPart.questions)
        ).filter(AptisSpeakingTest.id == test_id).first()