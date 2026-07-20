from sqlalchemy.orm import Session
from app.modules.APTIS.exam.models import AptisExamSubmission, AptisExamStatus

class AptisExamUtils:
    @staticmethod
    def calculate_aptis_cefr(total_score: int) -> str:
        """
        CEFR dua tren tong 4 ky nang chinh (Listening+Reading+Writing+Speaking) = /200.
        Grammar & Vocab la component rieng, KHONG tinh vao overall score.
        """
        if total_score >= 168: return "C"
        if total_score >= 136: return "B2"
        if total_score >= 96:  return "B1"
        if total_score >= 56:  return "A2"
        if total_score >= 24:  return "A1"
        return "A0"

    @staticmethod
    def recalculate_overall_score(db: Session, sub: AptisExamSubmission, auto_commit: bool = True):
        # --- Diem tung ky nang ---
        gv = sub.grammar_vocab_submission.total_score if sub.grammar_vocab_submission and sub.grammar_vocab_submission.total_score is not None else 0
        l  = sub.listening_submission.score  if sub.listening_submission  and sub.listening_submission.score  is not None else 0
        r  = sub.reading_submission.score    if sub.reading_submission    and sub.reading_submission.score    is not None else 0

        w = None
        if sub.writing_submission and sub.writing_submission.status == 'GRADED':
            w = sub.writing_submission.score or 0

        s = None
        if sub.speaking_submission and sub.speaking_submission.status == 'GRADED':
            s = sub.speaking_submission.total_score or 0

        # Luu diem tung phan len object (dynamic attributes cho Pydantic serialize)
        sub.grammar_vocab_score = gv
        # Expose grammar/vocab rieng tu relationship (khong can column DB moi)
        if sub.grammar_vocab_submission:
            sub.grammar_score = sub.grammar_vocab_submission.grammar_score
            sub.vocab_score   = sub.grammar_vocab_submission.vocab_score
        else:
            sub.grammar_score = None
            sub.vocab_score   = None
        sub.listening_score = l
        sub.reading_score   = r
        sub.writing_score   = w
        sub.speaking_score  = s

        # Overall = chi 4 ky nang chinh (Grammar & Vocab KHONG cong vao)
        current_overall = l + r + (w or 0) + (s or 0)

        is_fully_graded = True
        if sub.writing_submission and sub.writing_submission.status != 'GRADED':
            is_fully_graded = False
        if sub.speaking_submission and sub.speaking_submission.status != 'GRADED':
            is_fully_graded = False

        # Phat hien chuyen trang thai PENDING -> COMPLETED de gui notification
        was_pending = sub.status == AptisExamStatus.PENDING.value
        if was_pending and is_fully_graded:
            sub.status = AptisExamStatus.COMPLETED.value

        if sub.status == AptisExamStatus.COMPLETED.value:
            # Chi auto-update score
            if sub.overall_score != current_overall:
                sub.overall_score = current_overall
                if auto_commit:
                    db.commit()

            # Auto-set CEFR chi khi chua co (admin chua override)
            if not sub.overall_cefr_level:
                final_cefr = AptisExamUtils.calculate_aptis_cefr(current_overall)
                sub.overall_cefr_level = final_cefr
                if auto_commit:
                    db.commit()

            # Gui notification cho student khi vua chuyen tu PENDING -> COMPLETED
            # (chi gui 1 lan, khong gui lai khi admin override CEFR)
            if was_pending and is_fully_graded:
                AptisExamUtils._send_full_test_completed_notification(db, sub, auto_commit)

        elif sub.status == AptisExamStatus.PENDING.value:
            if sub.overall_score != current_overall or sub.overall_cefr_level is not None:
                sub.overall_score = current_overall
                sub.overall_cefr_level = None
                if auto_commit:
                    db.commit()

        return current_overall

    @staticmethod
    def _send_full_test_completed_notification(db: Session, sub: AptisExamSubmission, auto_commit: bool = True):
        """
        Gui thong bao cho student khi tat ca ky nang da duoc cham diem
        va bai thi Full Test chuyen sang trang thai COMPLETED.
        Ham nay chi duoc goi 1 lan duy nhat khi PENDING -> COMPLETED.
        """
        try:
            from app.modules.notifications.models import Notification
            from app.core.websockets import manager
            from datetime import datetime, timezone

            cefr = sub.overall_cefr_level or AptisExamUtils.calculate_aptis_cefr(sub.overall_score or 0)
            score = sub.overall_score or 0
            test_title = sub.full_test.title if sub.full_test else "APTIS Full Test"

            notification = Notification(
                student_id=sub.user_id,
                title="APTIS Full Test Graded!",
                message=(
                    f'Your "{test_title}" has been fully graded. '
                    f"Overall Score: {score}/200 — CEFR Level: {cefr}. "
                    f"Check your results now!"
                ),
                type="SUCCESS"
            )
            db.add(notification)
            if auto_commit:
                db.commit()
            else:
                db.flush()

            # Emit WebSocket notification
            payload = {
                "id": str(notification.id),
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "created_at": (
                    notification.created_at.isoformat()
                    if notification.created_at
                    else datetime.now(timezone.utc).isoformat()
                ),
                "is_read": False,
            }
            manager.send_personal_message_sync(payload, str(sub.user_id))

        except Exception as e:
            # Khong nen lam hong luong chinh neu notification that bai
            import logging
            logging.getLogger(__name__).warning(
                f"[AptisExamUtils] Failed to send full-test-completed notification "
                f"for submission {sub.id}: {e}"
            )