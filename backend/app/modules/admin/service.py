from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

# Import models Tổng quan
from app.modules.users.models import User
from app.modules.IELTS.exam.models import FullTest, ExamSubmission 

# Import models IELTS
from app.modules.IELTS.reading.models import ReadingTest
from app.modules.IELTS.listening.models import ListeningTest
from app.modules.IELTS.writing.models import WritingTest
from app.modules.IELTS.speaking.models import SpeakingTest

# Import models APTIS (Lưu ý: Bạn hãy kiểm tra lại tên class Model nếu có sai lệch nhẹ nhé)
from app.modules.APTIS.grammar_vocab.models import AptisGrammarVocabTest 
from app.modules.APTIS.reading.models import AptisReadingTest
from app.modules.APTIS.listening.models import AptisListeningTest
from app.modules.APTIS.writing.models import AptisWritingTest
from app.modules.APTIS.speaking.models import AptisSpeakingTest

class AdminService:
    @staticmethod
    def get_system_stats(db: Session):
        # Lấy ngày hôm nay để tính toán tăng trưởng
        today = date.today()

        return {
            # 1. Tổng quan (Dùng func.count để tối ưu tốc độ)
            "total_users": db.query(func.count(User.id)).scalar() or 0,
            "new_users_today": db.query(func.count(User.id)).filter(func.date(User.created_at) == today).scalar() or 0,
            
            # Tạm thời đếm lượt nộp bài của Full Test IELTS (sau này có thể cộng dồn thêm bài lẻ nếu cần)
            "total_submissions": db.query(func.count(ExamSubmission.id)).scalar() or 0,
            "total_full_tests": db.query(func.count(FullTest.id)).scalar() or 0,

            # 2. Phân bổ kỹ năng IELTS 
            "ielts_skills": {
                "Reading": db.query(func.count(ReadingTest.id)).scalar() or 0,
                "Listening": db.query(func.count(ListeningTest.id)).scalar() or 0,
                "Writing": db.query(func.count(WritingTest.id)).scalar() or 0,
                "Speaking": db.query(func.count(SpeakingTest.id)).scalar() or 0,
            },
            
            # 3. Phân bổ kỹ năng APTIS
            "aptis_skills": {
                "GrammarVocab": db.query(func.count(AptisGrammarVocabTest.id)).scalar() or 0,
                "Reading": db.query(func.count(AptisReadingTest.id)).scalar() or 0,
                "Listening": db.query(func.count(AptisListeningTest.id)).scalar() or 0,
                "Writing": db.query(func.count(AptisWritingTest.id)).scalar() or 0,
                "Speaking": db.query(func.count(AptisSpeakingTest.id)).scalar() or 0,
            }
        }