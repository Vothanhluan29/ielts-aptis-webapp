from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.modules.users.models import User
from app.modules.IELTS.exam.models import FullTest, ExamSubmission 

# Import models IELTS
from app.modules.IELTS.reading.models import ReadingTest
from app.modules.IELTS.listening.models import ListeningTest
from app.modules.IELTS.writing.models import WritingTest
from app.modules.IELTS.speaking.models import SpeakingTest
from app.modules.APTIS.exam.models import  AptisFullTest, AptisExamSubmission

from app.modules.APTIS.grammar_vocab.models import AptisGrammarVocabTest 
from app.modules.APTIS.reading.models import AptisReadingTest
from app.modules.APTIS.listening.models import AptisListeningTest
from app.modules.APTIS.writing.models import AptisWritingTest
from app.modules.APTIS.speaking.models import AptisSpeakingTest

class AdminService:
    @staticmethod
    def get_system_stats(db: Session, user: User = None):
        today = date.today()

        stats = {
            "total_users": db.query(func.count(User.id)).scalar() or 0,
            "new_users_today": db.query(func.count(User.id)).filter(func.date(User.created_at) == today).scalar() or 0,
            
            "total_submissions": db.query(func.count(ExamSubmission.id)).scalar() or 0,
            "total_full_tests": db.query(func.count(FullTest.id)).scalar() or 0,
            "total_aptis_full_tests": db.query(func.count(AptisFullTest.id)).scalar() or 0,
            "total_aptis_submissions": db.query(func.count(AptisExamSubmission.id)).scalar() or 0,

            # 2.  IELTS Skills Distribution
            "ielts_skills": {
                "Reading": db.query(func.count(ReadingTest.id)).scalar() or 0,
                "Listening": db.query(func.count(ListeningTest.id)).scalar() or 0,
                "Writing": db.query(func.count(WritingTest.id)).scalar() or 0,
                "Speaking": db.query(func.count(SpeakingTest.id)).scalar() or 0,
            },
            
            # 3. APTIS Skill Distribution
            "aptis_skills": {
                "GrammarVocab": db.query(func.count(AptisGrammarVocabTest.id)).scalar() or 0,
                "Reading": db.query(func.count(AptisReadingTest.id)).scalar() or 0,
                "Listening": db.query(func.count(AptisListeningTest.id)).scalar() or 0,
                "Writing": db.query(func.count(AptisWritingTest.id)).scalar() or 0,
                "Speaking": db.query(func.count(AptisSpeakingTest.id)).scalar() or 0,
            }
        }
        
        if user and user.role == "teacher":
            managed_classes = [tc.class_code for tc in user.teacher_classes]
            if managed_classes:
                student_ids = db.query(User.id).filter(User.class_code.in_(managed_classes), User.role == "student").all()
                student_ids = [s[0] for s in student_ids]
                
                stats["teacher_students"] = len(student_ids)
                if student_ids:
                    stats["teacher_aptis_submissions"] = db.query(func.count(AptisExamSubmission.id)).filter(AptisExamSubmission.user_id.in_(student_ids)).scalar() or 0
                else:
                    stats["teacher_aptis_submissions"] = 0
            else:
                stats["teacher_students"] = 0
                stats["teacher_aptis_submissions"] = 0

        return stats