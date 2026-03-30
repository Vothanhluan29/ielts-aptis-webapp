from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Tuple, Set, Dict, Any
from datetime import datetime, timedelta

# BẠN HÃY SỬA LẠI ĐƯỜNG DẪN IMPORT MODEL CHO KHỚP VỚI DỰ ÁN CỦA BẠN NHÉ
from app.modules.APTIS.grammar_vocab.models import AptisGrammarVocabSubmission, AptisGrammarVocabTest
from app.modules.APTIS.reading.models import AptisReadingSubmission, AptisReadingTest
from app.modules.APTIS.listening.models import AptisListeningSubmission, AptisListeningTest
from app.modules.APTIS.writing.models import AptisWritingSubmission, AptisWritingTest
from app.modules.APTIS.speaking.models import AptisSpeakingSubmission, AptisSpeakingTest
from app.modules.APTIS.exam.models import AptisExamSubmission # Full Test

# Import bộ Schema Đa chứng chỉ Aptis mà chúng ta vừa tạo
from . import schemas 

# Dictionary quy đổi CEFR để tìm ra mức cao nhất
CEFR_RANKS = {"A0": 0, "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C": 5}

class AptisUserStatsService:

    # ============================================================
    # 1. HELPERS
    # ============================================================
    @staticmethod
    def _get_score_from_submission(submission, is_full_test=False, is_speaking=False):
        """Hàm phụ trợ lấy điểm do tên cột ở các module có thể khác nhau"""
        if is_full_test:
            return getattr(submission, 'overall_score', None)
        elif is_speaking:
            return getattr(submission, 'total_score', getattr(submission, 'score', None))
        else:
            return getattr(submission, 'score', None)

    @staticmethod
    def _calculate_average_score(submissions, is_speaking=False) -> Tuple[float, int]:
        """Tính trung bình cộng cho thang điểm Aptis (thường là 50)"""
        if not submissions: return 0.0, 0
        
        graded_scores = []
        for s in submissions:
            score = AptisUserStatsService._get_score_from_submission(s, is_speaking=is_speaking)
            if score is not None and score >= 0:
                graded_scores.append(score)
                
        total_tests = len(submissions)
        if not graded_scores: return 0.0, total_tests
        
        # Aptis không làm tròn 0.5 như IELTS, chỉ cần làm tròn 1 chữ số thập phân
        avg = round(sum(graded_scores) / len(graded_scores), 1)
        return avg, total_tests

    @staticmethod
    def _generate_chart_data(exam_subs, gv_subs, read_subs, list_subs, writ_subs, speak_subs) -> List[schemas.ChartDataPoint]:
        data_map: Dict[str, Dict[str, Any]] = {}

        def process_submissions(subs, key, is_full_test=False, is_speaking=False):
            for s in subs:
                score = AptisUserStatsService._get_score_from_submission(s, is_full_test, is_speaking)
                if score is None: continue 
                
                # Full test có thể dùng trường khác (ví dụ start_time/submitted_at)
                date_val = getattr(s, 'submitted_at', getattr(s, 'start_time', None))
                if not date_val: continue
                
                date_str = date_val.strftime("%d/%m")
                
                if date_str not in data_map:
                    data_map[date_str] = {"date": date_str}
                
                if key not in data_map[date_str]:
                    data_map[date_str][key] = score

        process_submissions(exam_subs, "full_test", is_full_test=True)
        process_submissions(gv_subs, "grammar_vocab")
        process_submissions(read_subs, "reading")
        process_submissions(list_subs, "listening")
        process_submissions(writ_subs, "writing")
        process_submissions(speak_subs, "speaking", is_speaking=True)

        chart_list = [schemas.ChartDataPoint(**v) for v in data_map.values()]
        chart_list.reverse() 
        return chart_list[-10:]

    @staticmethod
    def _generate_streak_info(all_dates: Set[datetime.date]) -> schemas.StreakInfo:
        today = datetime.now().date()
        activity_map = []
        for i in range(6, -1, -1):
            check_date = today - timedelta(days=i)
            activity_map.append(check_date in all_dates)

        streak = 0
        curr_date = today
        if curr_date not in all_dates:
            curr_date -= timedelta(days=1)
            if curr_date not in all_dates:
                return schemas.StreakInfo(current_streak=0, activity_map=activity_map)

        while curr_date in all_dates:
            streak += 1
            curr_date -= timedelta(days=1)

        return schemas.StreakInfo(current_streak=streak, activity_map=activity_map)

    # ============================================================
    # 2. API 1: LẤY TỔNG QUAN (OVERVIEW)
    # ============================================================
    @staticmethod
    def get_overview_stats(db: Session, user_id: int) -> schemas.AptisOverviewStatsResponse:
        # Lấy bài Full Test (Chỉ lấy bài đã hoàn thành/chấm xong)
        exam_subs = db.query(AptisExamSubmission).filter(
            AptisExamSubmission.user_id == user_id, 
            AptisExamSubmission.status.in_(['COMPLETED', 'GRADED', 'FINISHED'])
        ).all()

        # Lấy bài Practice lẻ
        gv_subs = db.query(AptisGrammarVocabSubmission).join(AptisGrammarVocabTest).filter(
            AptisGrammarVocabSubmission.user_id == user_id, AptisGrammarVocabTest.is_full_test_only == False
        ).all()
        read_subs = db.query(AptisReadingSubmission).join(AptisReadingTest).filter(
            AptisReadingSubmission.user_id == user_id, AptisReadingTest.is_full_test_only == False
        ).all()
        list_subs = db.query(AptisListeningSubmission).join(AptisListeningTest).filter(
            AptisListeningSubmission.user_id == user_id, AptisListeningTest.is_full_test_only == False
        ).all()
        writ_subs = db.query(AptisWritingSubmission).join(AptisWritingTest).filter(
            AptisWritingSubmission.user_id == user_id, AptisWritingTest.is_full_test_only == False,
            AptisWritingSubmission.status == 'GRADED'
        ).all()
        speak_subs = db.query(AptisSpeakingSubmission).join(AptisSpeakingTest).filter(
            AptisSpeakingSubmission.user_id == user_id, AptisSpeakingTest.is_full_test_only == False,
            AptisSpeakingSubmission.status == 'GRADED'
        ).all()

        # Tính Full Test Stats (bao gồm cả quy đổi CEFR cao nhất)
        total_exams = len(exam_subs)
        avg_overall, max_overall = 0.0, 0.0
        highest_cefr = None
        
        if total_exams > 0:
            valid_scores = [e.overall_score for e in exam_subs if e.overall_score is not None]
            if valid_scores:
                avg_overall = round(sum(valid_scores) / len(valid_scores), 1)
                max_overall = max(valid_scores)
                
            # Tìm CEFR cao nhất
            max_rank = -1
            for e in exam_subs:
                if e.overall_cefr_level:
                    rank = CEFR_RANKS.get(e.overall_cefr_level.upper(), -1)
                    if rank > max_rank:
                        max_rank = rank
                        highest_cefr = e.overall_cefr_level.upper()

        full_test_stats = schemas.FullTestStats(
            total_exams=total_exams, average_overall=avg_overall, 
            highest_overall=max_overall, highest_cefr=highest_cefr
        )

        # Tính Skill Stats
        gv_avg, gv_count = AptisUserStatsService._calculate_average_score(gv_subs)
        r_avg, r_count = AptisUserStatsService._calculate_average_score(read_subs)
        l_avg, l_count = AptisUserStatsService._calculate_average_score(list_subs)
        w_avg, w_count = AptisUserStatsService._calculate_average_score(writ_subs)
        s_avg, s_count = AptisUserStatsService._calculate_average_score(speak_subs, is_speaking=True)

        skill_stats_list = [
            schemas.SkillStats(skill="GRAMMAR_VOCAB", average_score=gv_avg, total_tests=gv_count),
            schemas.SkillStats(skill="READING", average_score=r_avg, total_tests=r_count),
            schemas.SkillStats(skill="LISTENING", average_score=l_avg, total_tests=l_count),
            schemas.SkillStats(skill="WRITING", average_score=w_avg, total_tests=w_count),
            schemas.SkillStats(skill="SPEAKING", average_score=s_avg, total_tests=s_count),
        ]

        return schemas.AptisOverviewStatsResponse(
            full_test_stats=full_test_stats, skill_stats=skill_stats_list
        )

    # ============================================================
    # 3. API 2: LẤY DỮ LIỆU BIỂU ĐỒ (PROGRESS)
    # ============================================================
    @staticmethod
    def get_progress_data(db: Session, user_id: int) -> schemas.AptisProgressResponse:
        # Code truy vấn tương tự như Overview nhưng order by ngày tháng...
        exam_subs = db.query(AptisExamSubmission).filter(
            AptisExamSubmission.user_id == user_id, 
            AptisExamSubmission.status.in_(['COMPLETED', 'GRADED', 'FINISHED'])
        ).order_by(desc(AptisExamSubmission.start_time)).all()

        gv_subs = db.query(AptisGrammarVocabSubmission).join(AptisGrammarVocabTest).filter(
            AptisGrammarVocabSubmission.user_id == user_id, AptisGrammarVocabTest.is_full_test_only == False
        ).order_by(desc(AptisGrammarVocabSubmission.submitted_at)).all()
        
        read_subs = db.query(AptisReadingSubmission).join(AptisReadingTest).filter(
            AptisReadingSubmission.user_id == user_id, AptisReadingTest.is_full_test_only == False
        ).order_by(desc(AptisReadingSubmission.submitted_at)).all()
        
        list_subs = db.query(AptisListeningSubmission).join(AptisListeningTest).filter(
            AptisListeningSubmission.user_id == user_id, AptisListeningTest.is_full_test_only == False
        ).order_by(desc(AptisListeningSubmission.submitted_at)).all()
        
        writ_subs = db.query(AptisWritingSubmission).join(AptisWritingTest).filter(
            AptisWritingSubmission.user_id == user_id, AptisWritingTest.is_full_test_only == False,
            AptisWritingSubmission.status == 'GRADED'
        ).order_by(desc(AptisWritingSubmission.submitted_at)).all()
        
        speak_subs = db.query(AptisSpeakingSubmission).join(AptisSpeakingTest).filter(
            AptisSpeakingSubmission.user_id == user_id, AptisSpeakingTest.is_full_test_only == False,
            AptisSpeakingSubmission.status == 'GRADED'
        ).order_by(desc(AptisSpeakingSubmission.submitted_at)).all()

        # Tạo mảng các ngày có tương tác (all_dates)
        all_active_dates = set()
        for subs in [exam_subs, gv_subs, read_subs, list_subs, writ_subs, speak_subs]:
            for s in subs:
                date_val = getattr(s, 'submitted_at', getattr(s, 'start_time', None))
                if date_val:
                    all_active_dates.add(date_val.date())

        chart_data = AptisUserStatsService._generate_chart_data(exam_subs, gv_subs, read_subs, list_subs, writ_subs, speak_subs)
        streak_info = AptisUserStatsService._generate_streak_info(all_active_dates)

        return schemas.AptisProgressResponse(chart_data=chart_data, streak_info=streak_info)

    # ============================================================
    # 4. API 3: LẤY LỊCH SỬ HOẠT ĐỘNG (RECENT ACTIVITIES)
    # ============================================================
    @staticmethod
    def get_recent_activities(db: Session, user_id: int, limit: int = 10) -> List[schemas.ActivityItem]:
        exam_subs = db.query(AptisExamSubmission).options(joinedload(AptisExamSubmission.full_test)).filter(
            AptisExamSubmission.user_id == user_id,
            AptisExamSubmission.status.in_(['COMPLETED', 'GRADED', 'FINISHED'])
        ).order_by(desc(AptisExamSubmission.start_time)).limit(limit).all()

        gv_subs = db.query(AptisGrammarVocabSubmission).join(AptisGrammarVocabTest).options(joinedload(AptisGrammarVocabSubmission.test)).filter(
            AptisGrammarVocabSubmission.user_id == user_id, AptisGrammarVocabTest.is_full_test_only == False
        ).order_by(desc(AptisGrammarVocabSubmission.submitted_at)).limit(limit).all()
        
        read_subs = db.query(AptisReadingSubmission).join(AptisReadingTest).options(joinedload(AptisReadingSubmission.test)).filter(
            AptisReadingSubmission.user_id == user_id, AptisReadingTest.is_full_test_only == False
        ).order_by(desc(AptisReadingSubmission.submitted_at)).limit(limit).all()
        
        list_subs = db.query(AptisListeningSubmission).join(AptisListeningTest).options(joinedload(AptisListeningSubmission.test)).filter(
            AptisListeningSubmission.user_id == user_id, AptisListeningTest.is_full_test_only == False
        ).order_by(desc(AptisListeningSubmission.submitted_at)).limit(limit).all()
        
        writ_subs = db.query(AptisWritingSubmission).join(AptisWritingTest).options(joinedload(AptisWritingSubmission.test)).filter(
            AptisWritingSubmission.user_id == user_id, AptisWritingTest.is_full_test_only == False,
            AptisWritingSubmission.status == 'GRADED'
        ).order_by(desc(AptisWritingSubmission.submitted_at)).limit(limit).all()
        
        speak_subs = db.query(AptisSpeakingSubmission).join(AptisSpeakingTest).options(joinedload(AptisSpeakingSubmission.test)).filter(
            AptisSpeakingSubmission.user_id == user_id, AptisSpeakingTest.is_full_test_only == False,
            AptisSpeakingSubmission.status == 'GRADED'
        ).order_by(desc(AptisSpeakingSubmission.submitted_at)).limit(limit).all()

        activities = []

        def extract_activity(subs, s_type, is_full=False, is_speaking=False):
            for s in subs:
                date_val = getattr(s, 'submitted_at', getattr(s, 'start_time', None))
                if not date_val: continue
                
                # 🔥 FIX LỖI TIMEZONE Ở ĐÂY: 
                # Nếu date_val có chứa thông tin múi giờ (tzinfo), ta sẽ gỡ nó ra để biến thành offset-naive
                if date_val.tzinfo is not None:
                    date_val = date_val.replace(tzinfo=None)
                
                title = "Unknown Test"
                score = AptisUserStatsService._get_score_from_submission(s, is_full, is_speaking)
                cefr_level = getattr(s, 'overall_cefr_level', getattr(s, 'cefr_level', None))
                
                if is_full and getattr(s, 'full_test', None):
                    title = s.full_test.title
                elif not is_full and getattr(s, 'test', None):
                    title = s.test.title

                activities.append(schemas.ActivityItem(
                    id=s.id, type=s_type, score=score if score is not None else 0.0, 
                    cefr_level=cefr_level, date=date_val, title=title
                ))

        extract_activity(exam_subs, schemas.SkillType.FULLTEST, is_full=True)
        extract_activity(gv_subs, schemas.SkillType.GRAMMAR_VOCAB)
        extract_activity(read_subs, schemas.SkillType.READING)
        extract_activity(list_subs, schemas.SkillType.LISTENING)
        extract_activity(writ_subs, schemas.SkillType.WRITING)
        extract_activity(speak_subs, schemas.SkillType.SPEAKING, is_speaking=True)

        activities.sort(key=lambda x: x.date, reverse=True)
        return activities[:limit]