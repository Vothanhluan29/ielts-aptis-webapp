from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List

from app.modules.IELTS.exam.models import FullTest, ExamSubmission, ExamStatus, ExamStep
from app.modules.IELTS.exam import schemas
from app.modules.subscriptions.service import SubscriptionService

class ExamService:

    # =======================================================
    # 🛠️ UTILS (Logic làm tròn & Tính toán)
    # =======================================================
    @staticmethod
    def round_ielts_score(score: float) -> float:
        """Quy tắc làm tròn IELTS Overall chuẩn: .25 -> .5; .75 -> 1.0"""
        if score is None or score == 0:
            return 0.0
        decimal = score - int(score)
        if decimal < 0.25:
            return float(int(score))
        if decimal < 0.75:
            return int(score) + 0.5
        return float(int(score) + 1.0)

    @staticmethod
    def recalculate_overall_score(db: Session, sub: ExamSubmission, auto_commit: bool = True):
        """Tính toán lại điểm tổng. Trả về một Tuple chứa các điểm thành phần"""
        r = (sub.reading_submission.band_score or 0.0) if sub.reading_submission else 0.0
        l = (sub.listening_submission.band_score or 0.0) if sub.listening_submission else 0.0
        w = (sub.writing_submission.band_score or 0.0) if sub.writing_submission else 0.0
        s = (sub.speaking_submission.band_score or 0.0) if sub.speaking_submission else 0.0

        avg = (r + l + w + s) / 4
        new_overall = ExamService.round_ielts_score(avg)

        if sub.status == ExamStatus.COMPLETED.value and sub.overall_score != new_overall:
            sub.overall_score = new_overall
            if auto_commit:
                db.commit()
            
        return new_overall, r, l, w, s

    @staticmethod
    def _map_submission_to_schema(sub: ExamSubmission, new_overall, r, l, w, s):
        """Hàm Helper: Chủ động ép kiểu dữ liệu từ Model sang Schema Dict"""
        # Parse Pydantic từ ORM
        base_schema = schemas.ExamSubmissionResponse.model_validate(sub)
        # Chuyển thành Dict để nhét thêm data ảo
        sub_dict = base_schema.model_dump()
        
        sub_dict["reading_score"] = r
        sub_dict["listening_score"] = l
        sub_dict["writing_score"] = w
        sub_dict["speaking_score"] = s
        sub_dict["overall_score"] = new_overall
        
        return sub_dict

    # =======================================================
    # 📋 TEST MANAGEMENT (Admin & Student List)
    # =======================================================
   # =======================================================
    # 📋 TEST MANAGEMENT (Admin & Student List)
    # =======================================================
    @staticmethod
    def get_all_full_tests(db: Session, current_user_id: Optional[int] = None, admin_view: bool = False):
        query = db.query(FullTest)
        if not admin_view:
            query = query.filter(FullTest.is_published == True)

        tests = query.order_by(FullTest.created_at.desc()).all()

        result_list = []
        for test in tests:
            user_status = ExamStatus.NOT_STARTED.value
            current_step = ExamStep.NOT_STARTED.value
            exam_submission_id = None

            if current_user_id:
                latest_sub = db.query(ExamSubmission).filter(
                    ExamSubmission.full_test_id == test.id,
                    ExamSubmission.user_id == current_user_id
                ).order_by(ExamSubmission.start_time.desc()).first()

                if latest_sub:
                    user_status = latest_sub.status
                    current_step = latest_sub.current_step
                    exam_submission_id = latest_sub.id

            # 🔥 ĐÃ CẬP NHẬT: Gắn thêm 4 biến ID từ test (DB) vào Schema
            item = schemas.FullTestListItem(
                id=test.id,
                title=test.title,
                description=test.description,
                is_published=test.is_published,
                created_at=test.created_at,
                
                # Bổ sung 4 trường ID để Frontend hiện màu sắc Tag
                listening_test_id=test.listening_test_id,
                reading_test_id=test.reading_test_id,
                writing_test_id=test.writing_test_id,
                speaking_test_id=test.speaking_test_id,
                
                user_status=user_status,
                current_step=current_step,
                exam_submission_id=exam_submission_id
            )
            result_list.append(item)

        return result_list

    @staticmethod
    def get_full_test_detail(db: Session, test_id: int):
        return (
            db.query(FullTest)
            .options(
                joinedload(FullTest.reading_test),
                joinedload(FullTest.listening_test),
                joinedload(FullTest.writing_test),
                joinedload(FullTest.speaking_test),
            )
            .filter(FullTest.id == test_id)
            .first()
        )

    # =======================================================
    # 🚀 EXAM FLOW (User Actions)
    # =======================================================
    @staticmethod
    def start_exam(db: Session, user_id: int, full_test_id: int):
        existing_sub = db.query(ExamSubmission).filter(
            ExamSubmission.user_id == user_id,
            ExamSubmission.full_test_id == full_test_id,
            ExamSubmission.status == ExamStatus.IN_PROGRESS.value,
        ).first()

        if existing_sub:
            return existing_sub

        SubscriptionService.check_and_increment_quota(db, user_id, "EXAM")

        new_sub = ExamSubmission(
            user_id=user_id,
            full_test_id=full_test_id,
            status=ExamStatus.IN_PROGRESS.value,
            current_step=ExamStep.LISTENING.value,
            start_time=datetime.now(),
        )

        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub

    @staticmethod
    def submit_skill_part(db: Session, user_id: int, exam_submission_id: int, current_step: str, skill_submission_id: int):
        sub = db.query(ExamSubmission).filter(
            ExamSubmission.id == exam_submission_id,
            ExamSubmission.user_id == user_id,
        ).first()

        if not sub:
            raise HTTPException(404, "Exam submission not found")

        if current_step == ExamStep.LISTENING.value:
            sub.listening_submission_id = skill_submission_id
            sub.current_step = ExamStep.READING.value
        elif current_step == ExamStep.READING.value:
            sub.reading_submission_id = skill_submission_id
            sub.current_step = ExamStep.WRITING.value
        elif current_step == ExamStep.WRITING.value:
            sub.writing_submission_id = skill_submission_id
            sub.current_step = ExamStep.SPEAKING.value
        elif current_step == ExamStep.SPEAKING.value:
            sub.speaking_submission_id = skill_submission_id
            sub.current_step = ExamStep.FINISHED.value
            sub.status = ExamStatus.COMPLETED.value
            sub.completed_at = datetime.now()

        db.commit()
        db.refresh(sub)
        return {
            "message": "Step transition successful",
            "next_step": sub.current_step,
            "exam_submission_id": sub.id
        }

    # =======================================================
    # 📜 HISTORY & RESULTS
    # =======================================================
    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        sub = db.query(ExamSubmission).options(
            joinedload(ExamSubmission.full_test).joinedload(FullTest.reading_test),
            joinedload(ExamSubmission.full_test).joinedload(FullTest.listening_test),
            joinedload(ExamSubmission.full_test).joinedload(FullTest.writing_test),
            joinedload(ExamSubmission.full_test).joinedload(FullTest.speaking_test),
            joinedload(ExamSubmission.reading_submission),
            joinedload(ExamSubmission.listening_submission),
            joinedload(ExamSubmission.writing_submission),
            joinedload(ExamSubmission.speaking_submission)
        ).filter(ExamSubmission.id == submission_id).first()

        if sub:
            # Lấy điểm và map thẳng vào Dict
            new_overall, r, l, w, s = ExamService.recalculate_overall_score(db, sub)
            return ExamService._map_submission_to_schema(sub, new_overall, r, l, w, s)
        return None

    @staticmethod
    def get_my_history(db: Session, user_id: int):
        subs = db.query(ExamSubmission).options(
            joinedload(ExamSubmission.full_test),
            joinedload(ExamSubmission.reading_submission),
            joinedload(ExamSubmission.listening_submission),
            joinedload(ExamSubmission.writing_submission),
            joinedload(ExamSubmission.speaking_submission)
        ).filter(ExamSubmission.user_id == user_id).order_by(desc(ExamSubmission.start_time)).all()

        mapped_results = []
        for s in subs:
            new_overall, r, l, w, s_score = ExamService.recalculate_overall_score(db, s, auto_commit=False)
            mapped_dict = ExamService._map_submission_to_schema(s, new_overall, r, l, w, s_score)
            mapped_results.append(mapped_dict)
            
        db.commit() 
        return mapped_results

    # =======================================================
    # 👨‍💼 ADMIN: TEST MANAGEMENT
    # =======================================================
    @staticmethod
    def create_full_test(db: Session, data: schemas.FullTestCreate):
        full_test = FullTest(**data.model_dump())
        db.add(full_test)
        db.commit()
        db.refresh(full_test)
        return full_test

    @staticmethod
    def update_full_test(db: Session, test_id: int, data: schemas.FullTestUpdate):
        test = db.query(FullTest).filter(FullTest.id == test_id).first()
        if not test: return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(test, key, value)
        db.commit()
        db.refresh(test)
        return test

    @staticmethod
    def delete_full_test(db: Session, test_id: int):
        test = db.query(FullTest).filter(FullTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    # =======================================================
    # ADMIN - SUBMISSION MANAGEMENT
    # =======================================================
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(ExamSubmission).options(
            joinedload(ExamSubmission.user),
            joinedload(ExamSubmission.full_test),
            joinedload(ExamSubmission.reading_submission),
            joinedload(ExamSubmission.listening_submission),
            joinedload(ExamSubmission.writing_submission),
            joinedload(ExamSubmission.speaking_submission)
        )

        if status_filter:
            query = query.filter(ExamSubmission.status == status_filter)

        subs = query.order_by(ExamSubmission.start_time.desc()).offset(skip).limit(limit).all()

        mapped_results = []
        for sub in subs:
            new_overall, r, l, w, s_score = ExamService.recalculate_overall_score(db, sub, auto_commit=False)
            
            # Map thủ công cho Admin vì có thêm trường `user`
            base_schema = schemas.AdminExamSubmissionResponse.model_validate(sub)
            sub_dict = base_schema.model_dump()
            sub_dict.update({
                "reading_score": r, "listening_score": l,
                "writing_score": w, "speaking_score": s_score,
                "overall_score": new_overall
            })
            mapped_results.append(sub_dict)
            
        db.commit()
        return mapped_results