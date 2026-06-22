from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.modules.APTIS.reading import models, schemas
from .utils import AptisReadingUtils
from .test_service import AptisReadingTestService

class AptisReadingSubmissionService:
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.StudentSubmissionRequest):
        test = AptisReadingTestService.get_full_test_data(db, submission_data.test_id)
        if not test: return None

        # Khởi tạo các biến tính điểm thay vì gộp mảng
        raw_score = 0              # Tổng điểm học viên đạt được
        total_max_points = 0       # Tổng điểm tối đa của đề thi (Theo barem chuẩn sẽ là 50)
        correct_items = 0          # Số lượng item làm đúng (max 29)
        total_items = 0            # Tổng số item (max 29)
        answers_to_store = submission_data.answers or {}
        detailed_results = []
        
        # 1. LẶP QUA TỪNG PART ĐỂ ÁP DỤNG TRỌNG SỐ ĐIỂM
        for part in test.parts:
            part_num = int(getattr(part, 'part_number', 1))

            # Xác định trọng số điểm theo Part
            if part_num == 4:
                weight = 2      # Part 4: 2 điểm/câu
            elif part_num == 5:
                weight = 3      # Part 5: 3 điểm/câu
            else:
                weight = 1      # Part 1: 1 điểm/câu

            for group in part.groups:
                for q in group.questions:
                    q_id_str = str(q.id)
                    q_num_str = str(q.question_number)
                    user_ans = answers_to_store.get(q_id_str)
                    if user_ans is None:
                        user_ans = answers_to_store.get(q_num_str, "")
                    
                    cleaned_student = AptisReadingUtils.clean_text(user_ans)
                    cleaned_correct = AptisReadingUtils.clean_text(q.correct_answer)
                    q_type = getattr(q, 'question_type', '').upper()
                    
                    is_correct = False
                    max_points = weight # Điểm tối đa mặc định của câu này
                    points_to_add = 0   # Điểm thực tế học viên đạt được ở câu này

                    # 2. XỬ LÝ RIÊNG CÂU SẮP XẾP (PART 2) - CHẤM ĐIỂM TỪNG VỊ TRÍ
                    if q_type == 'REORDER_SENTENCES':
                        user_arr = cleaned_student.split('-')
                        correct_arr = cleaned_correct.split('-')
                        
                        max_points = len(correct_arr) if len(correct_arr) > 0 else 1
                        total_items += max_points
                        
                        if len(user_arr) == len(correct_arr) and len(correct_arr) > 0:
                            # Đếm số vị trí trùng khớp
                            matches = sum(1 for u, c in zip(user_arr, correct_arr) if u == c)
                            points_to_add = matches # Đúng vị trí nào ăn 1 điểm vị trí đó
                            correct_items += matches
                            
                            if matches == max_points:
                                is_correct = True
                                
                    # 3. CHẤM CÁC CÂU TRẮC NGHIỆM/ĐIỀN TỪ BÌNH THƯỜNG
                    else:
                        total_items += 1
                        accepted_answers = [ans.strip() for ans in cleaned_correct.replace('|', '/').split('/')]
                        if cleaned_student in accepted_answers:
                            is_correct = True
                            points_to_add = weight # Trả lời đúng nhận trọn điểm trọng số
                            correct_items += 1

                    # Cộng dồn điểm vào tổng bài thi
                    raw_score += points_to_add
                    total_max_points += max_points

                    detailed_results.append({
                        "id": q.id, 
                        "question_number": q.question_number,
                        "question_text": q.question_text,
                        "user_answer": user_ans,
                        "correct_answer": q.correct_answer,
                        "is_correct": is_correct,
                        "explanation": q.explanation
                    })

        # 4. QUY ĐỔI ĐIỂM VÀ LƯU DATABASE
        scoring_result = AptisReadingUtils.calculate_aptis_score_and_cefr(raw_score, total_max_points)
        
        db_submission = models.AptisReadingSubmission(
            user_id=user_id,
            test_id=test.id,
            user_answers=answers_to_store,
            correct_count=correct_items,   # Lưu số câu đúng (max 29)
            score=scoring_result["score"],
            cefr_level=scoring_result["cefr_level"],
            submitted_at=datetime.now(),
            status=models.AptisReadingStatus.GRADED.value,
            is_full_test_only=submission_data.is_full_test_only
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        
        return schemas.SubmissionDetail(
            id=db_submission.id,
            test_id=db_submission.test_id,
            test={"id": test.id, "title": test.title, "description": test.description}, 
            user_id=db_submission.user_id,
            status=db_submission.status,
            is_full_test_only=db_submission.is_full_test_only,
            
            correct_count=db_submission.correct_count,
            score=db_submission.score,
            cefr_level=db_submission.cefr_level,
            total_questions=total_items, # Trả về tổng câu (29)
            
            submitted_at=db_submission.submitted_at,
            user_answers=db_submission.user_answers,
            results=detailed_results
        )


    @staticmethod
    def get_student_history(db: Session, user_id: int):
        results = (
            db.query(models.AptisReadingSubmission, models.AptisReadingTest)
            .join(models.AptisReadingTest, models.AptisReadingSubmission.test_id == models.AptisReadingTest.id)
            .filter(models.AptisReadingSubmission.user_id == user_id, models.AptisReadingSubmission.is_full_test_only == False)
            .order_by(models.AptisReadingSubmission.submitted_at.desc())
            .all()
        )
        
        return [
            schemas.SubmissionHistoryItem(
                id=sub.id, 
                test_id=sub.test_id, 
                test={"id": test.id, "title": test.title, "description": test.description}, 
                status=sub.status,
                is_full_test_only=sub.is_full_test_only,
                
                correct_count=sub.correct_count,
                score=sub.score,
                cefr_level=sub.cefr_level,
                total_questions=29, # 29 câu
                
                submitted_at=sub.submitted_at
            ) for sub, test in results
        ]

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        submission = db.query(models.AptisReadingSubmission).filter(models.AptisReadingSubmission.id == submission_id).first()
        if not submission: return None
        
        test = AptisReadingTestService.get_full_test_data(db, submission.test_id)
        
        all_questions = []
        if test:
             for part in test.parts:
                for group in part.groups:
                    all_questions.extend(group.questions)
        
        all_questions.sort(key=lambda x: x.question_number)

        detailed_results = []
        student_answers_map = submission.user_answers or {} 
        
        for q in all_questions:
            q_id = str(q.id)
            q_num = str(q.question_number)
            student_ans = student_answers_map.get(q_id)
            if student_ans is None:
                student_ans = student_answers_map.get(q_num, "")
            
            cleaned_student = AptisReadingUtils.clean_text(student_ans)
            cleaned_correct = AptisReadingUtils.clean_text(q.correct_answer)
            accepted_answers = [a.strip() for a in cleaned_correct.replace('|', '/').split('/')]
            is_correct = cleaned_student in accepted_answers

            detailed_results.append({
                "id": q.id,
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": student_ans,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation
            })
            
        return schemas.SubmissionDetail(
            id=submission.id,
            test_id=submission.test_id,
            test={"id": test.id, "title": test.title, "description": test.description} if test else None, 
            user_id=submission.user_id,
            status=submission.status,
            is_full_test_only=submission.is_full_test_only,
            
            correct_count=submission.correct_count,
            score=submission.score,
            cefr_level=submission.cefr_level,
            total_questions=29, # Trả về 29 câu
            
            submitted_at=submission.submitted_at,
            user_answers=submission.user_answers,
            results=detailed_results 
        )
    
    @staticmethod
    def get_all_submissions_for_admin(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(models.AptisReadingSubmission).options(
            joinedload(models.AptisReadingSubmission.user),
            joinedload(models.AptisReadingSubmission.test)
        )
        if status_filter:
            query = query.filter(models.AptisReadingSubmission.status == status_filter)
            
        submissions = query.order_by(models.AptisReadingSubmission.submitted_at.desc()).offset(skip).limit(limit).all()
        
        results = []
        for sub in submissions:
            results.append(
                schemas.AdminReadingSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, 
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    
                    correct_count=sub.correct_count,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    total_questions=29, # Trả về 29 câu
                    
                    submitted_at=sub.submitted_at,
                    user_answers={}, 
                    results=[]      
                )
            )
        return results

    @staticmethod
    def get_user_history_for_admin(db: Session, target_user_id: int):
        submissions = db.query(models.AptisReadingSubmission).options(
            joinedload(models.AptisReadingSubmission.user),
            joinedload(models.AptisReadingSubmission.test)
        ).filter(
            models.AptisReadingSubmission.user_id == target_user_id
        ).order_by(models.AptisReadingSubmission.submitted_at.desc()).all()

        results = []
        for sub in submissions:
            results.append(
                schemas.AdminReadingSubmissionResponse(
                    id=sub.id,
                    test_id=sub.test_id,
                    test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, 
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    
                    correct_count=sub.correct_count,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    total_questions=29, # Trả về 29 câu
                    
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]
                )
            )
        return results