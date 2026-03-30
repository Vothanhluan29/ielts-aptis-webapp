from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List

from .models import AptisFullTest, AptisExamSubmission, AptisExamStatus, AptisExamStep
from . import schemas
from app.modules.subscriptions.service import SubscriptionService

class AptisExamService:

    # =======================================================
    # 🛠️ UTILS: TÍNH ĐIỂM VÀ ĐÁNH GIÁ CEFR APTIS
    # =======================================================
    @staticmethod
    def calculate_aptis_cefr(total_score: int) -> str:
        """Quy đổi CEFR cho Aptis dựa trên tổng 250 điểm (5 kỹ năng x 50)"""
        if total_score >= 210: return "C"
        if total_score >= 170: return "B2"
        if total_score >= 120: return "B1"
        if total_score >= 70:  return "A2"
        if total_score >= 30:  return "A1"
        return "A0"

    @staticmethod
    def recalculate_overall_score(db: Session, sub: AptisExamSubmission, auto_commit: bool = True):
        """Tổng hợp điểm từ 5 phần thi lẻ và xếp loại CEFR"""
        
        # 1. 3 Kỹ năng chấm tự động: Luôn trả về số (mặc định là 0 nếu trống)
        gv = sub.grammar_vocab_submission.total_score if sub.grammar_vocab_submission and sub.grammar_vocab_submission.total_score is not None else 0
        l  = sub.listening_submission.score if sub.listening_submission and sub.listening_submission.score is not None else 0
        r  = sub.reading_submission.score if sub.reading_submission and sub.reading_submission.score is not None else 0
        
        # 2. 2 Kỹ năng thủ công: Chỉ có điểm khi Admin đã chấm (status = GRADED), nếu không trả về None
        w = None
        if sub.writing_submission and sub.writing_submission.status == 'GRADED':
            w = sub.writing_submission.score or 0
            
        s = None
        if sub.speaking_submission and sub.speaking_submission.status == 'GRADED':
            s = sub.speaking_submission.total_score or 0

        # Gán giá trị vào object để Schema ném ra Frontend
        sub.grammar_vocab_score = gv
        sub.listening_score = l
        sub.reading_score = r
        sub.writing_score = w
        sub.speaking_score = s

        # Tính tổng điểm tạm thời (coi None là 0 trong lúc cộng)
        current_overall = gv + l + r + (w or 0) + (s or 0)

        # 🔥 LOGIC AUTO-COMPLETE: Kiểm tra xem Admin đã chấm xong hết tự luận chưa?
        is_fully_graded = True
        if sub.writing_submission and sub.writing_submission.status != 'GRADED':
            is_fully_graded = False
        if sub.speaking_submission and sub.speaking_submission.status != 'GRADED':
            is_fully_graded = False

        # Nếu bài đang PENDING mà giáo viên vừa chấm xong môn cuối -> Tự động chuyển thành COMPLETED
        if sub.status == AptisExamStatus.PENDING.value and is_fully_graded:
            sub.status = AptisExamStatus.COMPLETED.value

        # 🔥 CẬP NHẬT DATABASE DỰA THEO STATUS
        if sub.status == AptisExamStatus.COMPLETED.value:
            # Khi đã hoàn thành 100%, tính và cấp CEFR
            final_cefr = AptisExamService.calculate_aptis_cefr(current_overall)
            if sub.overall_score != current_overall or sub.overall_cefr_level != final_cefr:
                sub.overall_score = current_overall
                sub.overall_cefr_level = final_cefr
                if auto_commit:
                    db.commit()
                    
        elif sub.status == AptisExamStatus.PENDING.value:
            # Khi đang chờ chấm, cập nhật điểm tạm thời và XÓA CEFR
            if sub.overall_score != current_overall or sub.overall_cefr_level is not None:
                sub.overall_score = current_overall
                sub.overall_cefr_level = None 
                if auto_commit:
                    db.commit()
            
        return current_overall

    # =======================================================
    # 📋 TEST MANAGEMENT (Danh sách cho Student & Admin)
    # =======================================================
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

    # =======================================================
    # 🚀 EXAM FLOW (Hệ thống điều hướng tự động & Nộp bài)
    # =======================================================
    @staticmethod
    def start_exam(db: Session, user_id: int, full_test_id: int):
        existing_sub = db.query(AptisExamSubmission).filter(
            AptisExamSubmission.user_id == user_id,
            AptisExamSubmission.full_test_id == full_test_id,
            AptisExamSubmission.status == AptisExamStatus.IN_PROGRESS.value,
        ).first()

        if existing_sub:
            return existing_sub

        try:
            SubscriptionService.check_and_increment_quota(db, user_id, "APTIS_FULL_EXAM")
        except Exception as e:
            raise HTTPException(400, str(e))

        new_sub = AptisExamSubmission(
            user_id=user_id,
            full_test_id=full_test_id,
            status=AptisExamStatus.IN_PROGRESS.value,
            current_step=AptisExamStep.GRAMMAR_VOCAB.value,
            start_time=datetime.now(),
        )

        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub

    @staticmethod
    def submit_skill_part(db: Session, user_id: int, exam_submission_id: int, current_step: str, skill_submission_id: int):
        sub = db.query(AptisExamSubmission).filter(
            AptisExamSubmission.id == exam_submission_id,
            AptisExamSubmission.user_id == user_id,
        ).first()

        if not sub:
            raise HTTPException(404, "Exam submission not found")

        # Hệ thống điều hướng luồng bài thi Aptis
        if current_step == AptisExamStep.GRAMMAR_VOCAB.value:
            sub.grammar_vocab_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.LISTENING.value
            
        elif current_step == AptisExamStep.LISTENING.value:
            sub.listening_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.READING.value
            
        elif current_step == AptisExamStep.READING.value:
            sub.reading_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.WRITING.value
            
        elif current_step == AptisExamStep.WRITING.value:
            sub.writing_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.SPEAKING.value
            
        elif current_step == AptisExamStep.SPEAKING.value:
            sub.speaking_submission_id = skill_submission_id
            sub.current_step = AptisExamStep.FINISHED.value
            
            sub.status = AptisExamStatus.PENDING.value
            sub.completed_at = datetime.now()

        db.commit()
        db.refresh(sub)
        
        # Cập nhật điểm ngay khi có thay đổi
        if sub.status in [AptisExamStatus.COMPLETED.value, AptisExamStatus.PENDING.value]:
            AptisExamService.recalculate_overall_score(db, sub)

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
        sub = db.query(AptisExamSubmission).options(
            joinedload(AptisExamSubmission.user),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.grammar_vocab_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.listening_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.reading_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.writing_test),
            joinedload(AptisExamSubmission.full_test).joinedload(AptisFullTest.speaking_test),
            joinedload(AptisExamSubmission.grammar_vocab_submission),
            joinedload(AptisExamSubmission.listening_submission),
            joinedload(AptisExamSubmission.reading_submission),
            joinedload(AptisExamSubmission.writing_submission),
            joinedload(AptisExamSubmission.speaking_submission)
        ).filter(AptisExamSubmission.id == submission_id).first()

        if sub:
            AptisExamService.recalculate_overall_score(db, sub)
        return sub

    @staticmethod
    def get_my_history(db: Session, user_id: int):
        subs = db.query(AptisExamSubmission).options(
            joinedload(AptisExamSubmission.full_test),
            joinedload(AptisExamSubmission.grammar_vocab_submission),
            joinedload(AptisExamSubmission.listening_submission),
            joinedload(AptisExamSubmission.reading_submission),
            joinedload(AptisExamSubmission.writing_submission),
            joinedload(AptisExamSubmission.speaking_submission)
        ).filter(AptisExamSubmission.user_id == user_id).order_by(desc(AptisExamSubmission.start_time)).all()

        for s in subs:
            AptisExamService.recalculate_overall_score(db, s, auto_commit=False)
            
        db.commit() 
        return subs

    # =======================================================
    # 👨‍💼 ADMIN: TEST MANAGEMENT
    # =======================================================
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

    # =======================================================
    # 📑 ADMIN: SUBMISSION MANAGEMENT
    # =======================================================
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(AptisExamSubmission).options(
            joinedload(AptisExamSubmission.user),
            joinedload(AptisExamSubmission.full_test),
            joinedload(AptisExamSubmission.grammar_vocab_submission),
            joinedload(AptisExamSubmission.listening_submission),
            joinedload(AptisExamSubmission.reading_submission),
            joinedload(AptisExamSubmission.writing_submission),
            joinedload(AptisExamSubmission.speaking_submission)
        )

        if status_filter:
            query = query.filter(AptisExamSubmission.status == status_filter)

        total = query.count()
        subs = query.order_by(AptisExamSubmission.start_time.desc()).offset(skip).limit(limit).all()

        for sub in subs:
            AptisExamService.recalculate_overall_score(db, sub, auto_commit=False)
            
        db.commit()

        return {"items": subs, "total": total}