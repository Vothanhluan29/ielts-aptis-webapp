from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Tuple, Set, Dict, Any
from datetime import datetime, timedelta

# Import Models
from app.modules.IELTS.user_stats import schemas
from app.modules.IELTS.reading.models import ReadingSubmission, ReadingTest
from app.modules.IELTS.listening.models import ListeningSubmission, ListeningTest
from app.modules.IELTS.writing.models import WritingSubmission, WritingTest
from app.modules.IELTS.speaking.models import SpeakingSubmission, SpeakingTest
from app.modules.IELTS.exam.models import ExamSubmission


class UserStatsService:

    # ============================================================
    # 1. HELPERS (Giữ nguyên logic cực tốt của bạn)
    # ============================================================
    @staticmethod
    def _calculate_average_score(submissions) -> Tuple[float, int]:
        if not submissions: return 0.0, 0
        graded_scores = [s.band_score for s in submissions if s.band_score is not None and s.band_score >= 0]
        total_tests = len(submissions)
        if not graded_scores: return 0.0, total_tests
        raw_avg = sum(graded_scores) / len(graded_scores)
        ielts_avg = round(raw_avg * 2) / 2 
        return ielts_avg, total_tests

    @staticmethod
    def _generate_chart_data(exam_subs, read_subs, list_subs, writ_subs, speak_subs) -> List[schemas.ChartDataPoint]:
        data_map: Dict[str, Dict[str, Any]] = {}

        def process_submissions(subs, key, is_full_test=False):
            for s in subs:
                score = s.overall_score if is_full_test else s.band_score
                if score is None: continue 
                
                date_val = s.completed_at if is_full_test else s.submitted_at
                if not date_val: continue
                
                date_str = date_val.strftime("%d/%m")
                
                if date_str not in data_map:
                    data_map[date_str] = {"date": date_str}
                
                if key not in data_map[date_str]:
                    data_map[date_str][key] = score

        process_submissions(exam_subs, "full_test", is_full_test=True)
        process_submissions(read_subs, "reading")
        process_submissions(list_subs, "listening")
        process_submissions(writ_subs, "writing")
        process_submissions(speak_subs, "speaking")

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
    # 2. API 1: LẤY TỔNG QUAN (OVERVIEW) - CHẠY NHANH
    # ============================================================
    @staticmethod
    def get_overview_stats(db: Session, user_id: int) -> schemas.OverviewStatsResponse:
        # Lấy bài Full Test
        exam_subs = db.query(ExamSubmission.overall_score).filter(
            ExamSubmission.user_id == user_id, ExamSubmission.completed_at.isnot(None)
        ).all()

        # Lấy bài Practice lẻ
        read_subs = db.query(ReadingSubmission.band_score).join(ReadingTest).filter(
            ReadingSubmission.user_id == user_id, ReadingTest.is_full_test_only == False
        ).all()
        list_subs = db.query(ListeningSubmission.band_score).join(ListeningTest).filter(
            ListeningSubmission.user_id == user_id, ListeningTest.is_full_test_only == False
        ).all()
        writ_subs = db.query(WritingSubmission.band_score).join(WritingTest).filter(
            WritingSubmission.user_id == user_id, WritingTest.is_full_test_only == False
        ).all()
        speak_subs = db.query(SpeakingSubmission.band_score).join(SpeakingTest).filter(
            SpeakingSubmission.user_id == user_id, SpeakingTest.is_full_test_only == False
        ).all()

        # Tính Full Test Stats
        total_exams = len(exam_subs)
        avg_overall, max_overall = 0.0, 0.0
        if total_exams > 0:
            valid_scores = [e.overall_score for e in exam_subs if e.overall_score is not None]
            if valid_scores:
                avg_overall = round((sum(valid_scores) / len(valid_scores)) * 2) / 2
                max_overall = max(valid_scores)

        full_test_stats = schemas.FullTestStats(
            total_exams=total_exams, average_overall=avg_overall, highest_overall=max_overall
        )

        # Tính Skill Stats
        r_avg, r_count = UserStatsService._calculate_average_score(read_subs)
        l_avg, l_count = UserStatsService._calculate_average_score(list_subs)
        w_avg, w_count = UserStatsService._calculate_average_score(writ_subs)
        s_avg, s_count = UserStatsService._calculate_average_score(speak_subs)

        skill_stats_list = [
            schemas.SkillStats(skill="READING", average_score=r_avg, total_tests=r_count),
            schemas.SkillStats(skill="LISTENING", average_score=l_avg, total_tests=l_count),
            schemas.SkillStats(skill="WRITING", average_score=w_avg, total_tests=w_count),
            schemas.SkillStats(skill="SPEAKING", average_score=s_avg, total_tests=s_count),
        ]

        return schemas.OverviewStatsResponse(
            full_test_stats=full_test_stats, skill_stats=skill_stats_list
        )

    # ============================================================
    # 3. API 2: LẤY DỮ LIỆU BIỂU ĐỒ (PROGRESS)
    # ============================================================
    @staticmethod
    def get_progress_data(db: Session, user_id: int) -> schemas.ProgressResponse:
        exam_subs = db.query(ExamSubmission.overall_score, ExamSubmission.completed_at).filter(
            ExamSubmission.user_id == user_id, ExamSubmission.completed_at.isnot(None)
        ).order_by(desc(ExamSubmission.completed_at)).all()

        read_subs = db.query(ReadingSubmission.band_score, ReadingSubmission.submitted_at).join(ReadingTest).filter(
            ReadingSubmission.user_id == user_id, ReadingTest.is_full_test_only == False
        ).order_by(desc(ReadingSubmission.submitted_at)).all()
        list_subs = db.query(ListeningSubmission.band_score, ListeningSubmission.submitted_at).join(ListeningTest).filter(
            ListeningSubmission.user_id == user_id, ListeningTest.is_full_test_only == False
        ).order_by(desc(ListeningSubmission.submitted_at)).all()
        writ_subs = db.query(WritingSubmission.band_score, WritingSubmission.submitted_at).join(WritingTest).filter(
            WritingSubmission.user_id == user_id, WritingTest.is_full_test_only == False
        ).order_by(desc(WritingSubmission.submitted_at)).all()
        speak_subs = db.query(SpeakingSubmission.band_score, SpeakingSubmission.submitted_at).join(SpeakingTest).filter(
            SpeakingSubmission.user_id == user_id, SpeakingTest.is_full_test_only == False
        ).order_by(desc(SpeakingSubmission.submitted_at)).all()

        # Tạo mảng các ngày có tương tác (all_dates)
        all_active_dates = set()
        for subs, is_full in [(exam_subs, True), (read_subs, False), (list_subs, False), (writ_subs, False), (speak_subs, False)]:
            for s in subs:
                date_val = s.completed_at if is_full else s.submitted_at
                if date_val:
                    all_active_dates.add(date_val.date())

        chart_data = UserStatsService._generate_chart_data(exam_subs, read_subs, list_subs, writ_subs, speak_subs)
        streak_info = UserStatsService._generate_streak_info(all_active_dates)

        return schemas.ProgressResponse(chart_data=chart_data, streak_info=streak_info)

    # ============================================================
    # 4. API 3: LẤY LỊCH SỬ HOẠT ĐỘNG (RECENT ACTIVITIES)
    # ============================================================
    @staticmethod
    def get_recent_activities(db: Session, user_id: int, limit: int = 10) -> schemas.RecentActivitiesResponse: # 🔥 ĐÃ SỬA TYPE HINT
        exam_subs = db.query(ExamSubmission).options(joinedload(ExamSubmission.full_test)).filter(
            ExamSubmission.user_id == user_id, ExamSubmission.completed_at.isnot(None)
        ).order_by(desc(ExamSubmission.completed_at)).limit(limit).all()

        read_subs = db.query(ReadingSubmission).join(ReadingTest).options(joinedload(ReadingSubmission.test)).filter(
            ReadingSubmission.user_id == user_id, ReadingTest.is_full_test_only == False
        ).order_by(desc(ReadingSubmission.submitted_at)).limit(limit).all()
        
        list_subs = db.query(ListeningSubmission).join(ListeningTest).options(joinedload(ListeningSubmission.test)).filter(
            ListeningSubmission.user_id == user_id, ListeningTest.is_full_test_only == False
        ).order_by(desc(ListeningSubmission.submitted_at)).limit(limit).all()
        
        writ_subs = db.query(WritingSubmission).join(WritingTest).options(joinedload(WritingSubmission.test)).filter(
            WritingSubmission.user_id == user_id, WritingTest.is_full_test_only == False
        ).order_by(desc(WritingSubmission.submitted_at)).limit(limit).all()
        
        speak_subs = db.query(SpeakingSubmission).join(SpeakingTest).options(joinedload(SpeakingSubmission.test)).filter(
            SpeakingSubmission.user_id == user_id, SpeakingTest.is_full_test_only == False
        ).order_by(desc(SpeakingSubmission.submitted_at)).limit(limit).all()

        activities = []

        def extract_activity(subs, s_type, is_full=False):
            for s in subs:
                date_val = s.completed_at if is_full else s.submitted_at
                if not date_val: continue
                
                title = "Unknown Test"
                score = s.overall_score if is_full else s.band_score
                
                if is_full and hasattr(s, 'full_test') and s.full_test:
                    title = s.full_test.title
                elif not is_full and hasattr(s, 'test') and s.test:
                    title = s.test.title

                activities.append(schemas.ActivityItem(
                    id=s.id, type=s_type, score=score if score is not None else 0.0, date=date_val, title=title
                ))

        extract_activity(exam_subs, schemas.SkillType.FULLTEST, is_full=True)
        extract_activity(read_subs, schemas.SkillType.READING)
        extract_activity(list_subs, schemas.SkillType.LISTENING)
        extract_activity(writ_subs, schemas.SkillType.WRITING)
        extract_activity(speak_subs, schemas.SkillType.SPEAKING)

        # Trộn tất cả lại, sắp xếp theo thời gian mới nhất
        activities.sort(key=lambda x: x.date, reverse=True)
        
        # 🔥 ĐÃ SỬA: Đóng gói vào schema RecentActivitiesResponse
        return schemas.RecentActivitiesResponse(activities=activities[:limit])