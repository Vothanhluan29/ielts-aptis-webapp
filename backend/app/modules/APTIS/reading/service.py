from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime
from typing import List, Optional
from sqlalchemy import func

# 🔴 CHÚ Ý: Đã đổi import sang thư mục aptis
from app.modules.APTIS.reading import models
from app.modules.APTIS.reading import schemas

class AptisReadingService:

    # 🔥 HỆ THỐNG ĐIỂM VÀ CEFR (Chuẩn Aptis - Scale 50)
    @staticmethod
    def calculate_aptis_score_and_cefr(correct_count: int, total_questions: int = 25) -> dict:
        # 1. Tính điểm quy chiếu (Scale Score) trên thang 50
        # Nếu có 25 câu, đúng 18 câu -> (18/25)*50 = 36 điểm
        if total_questions > 0:
            scale_score = round((correct_count / total_questions) * 50)
        else:
            scale_score = 0

        # 2. Tính trình độ CEFR theo đúng chuẩn PREP
        cefr = "A0"
        if correct_count >= 21:    # 21 - 25 câu
            cefr = "C"
        elif correct_count >= 17:  # 17 - 20 câu
            cefr = "B2"
        elif correct_count >= 12:  # 12 - 16 câu
            cefr = "B1"
        elif correct_count >= 6:   # 6 - 11 câu (Lấp khoảng trống cho A2)
            cefr = "A2"
        elif correct_count >= 1:   # 1 - 5 câu (Lấp khoảng trống cho A1)
            cefr = "A1"
            
        return {
            "score": scale_score,     # Lát nữa sẽ lưu vào cột 'score' (VD: 34)
            "cefr_level": cefr        # Lát nữa sẽ lưu vào cột 'cefr_level' (VD: "B2")
        }

    # Giữ nguyên hàm clean_text vì nó cực kỳ hữu ích cho dạng bài Điền Từ (Fill in blanks)
    @staticmethod
    def clean_text(text) -> str:
        if text is None: return ""
        return " ".join(str(text).strip().lower().split())

    # =======================================================
    # 📝 TEST MANAGEMENT (CRUD - ADMIN)
    # =======================================================
    @staticmethod
    def create_test(db: Session, test_in: schemas.TestCreateOrUpdate):
        db_test = models.AptisReadingTest(
            title=test_in.title, 
            description=test_in.description, # 🔥 ĐÃ THÊM: Lưu description vào DB
            time_limit=test_in.time_limit,
            is_published=test_in.is_published,
            is_full_test_only=test_in.is_full_test_only 
        )
        db.add(db_test)
        db.flush() 

        # 🟢 Đổi passage thành part
        for p_data in test_in.parts:
            db_part = models.AptisReadingPart(
                test_id=db_test.id,
                part_number=p_data.part_number,
                title=p_data.title,
                content=p_data.content # Content có thể null cho Part 1, 2
            )
            db.add(db_part)
            db.flush()

            for g_data in p_data.groups:
                db_group = models.AptisReadingQuestionGroup(
                    part_id=db_part.id,
                    instruction=g_data.instruction,
                    image_url=g_data.image_url,
                    order=g_data.order
                )
                db.add(db_group)
                db.flush()

                for q_data in g_data.questions:
                    db_question = models.AptisReadingQuestion(
                        group_id=db_group.id,
                        question_number=q_data.question_number,
                        question_text=q_data.question_text,
                        question_type=q_data.question_type,
                        options=q_data.options,
                        correct_answer=q_data.correct_answer,
                        explanation=q_data.explanation
                    )
                    db.add(db_question)
        
        db.commit()
        return AptisReadingService.get_full_test_data(db, db_test.id) 
        

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: schemas.TestCreateOrUpdate):
        # 1. BẮT BUỘC: Phải kéo Test lên cùng với parts bằng joinedload 
        # Để SQLAlchemy có thể "nhìn thấy" các part cũ mà xóa (Tracking)
        test = db.query(models.AptisReadingTest).options(
            joinedload(models.AptisReadingTest.parts)
        ).filter(models.AptisReadingTest.id == test_id).first()
        
        if not test: return None

        # 2. Cập nhật thông tin cơ bản
        if test_in.title is not None: test.title = test_in.title
        if test_in.description is not None: test.description = test_in.description # 🔥 ĐÃ THÊM: Cập nhật description
        if test_in.time_limit is not None: test.time_limit = test_in.time_limit
        if test_in.is_published is not None: test.is_published = test_in.is_published
        if test_in.is_full_test_only is not None: test.is_full_test_only = test_in.is_full_test_only

        # 3. TỐI ƯU HÓA UPDATE BẰNG OOP: Thay thế toàn bộ Parts
        if test_in.parts is not None:
            # 🔥 BƯỚC 1: Xóa toàn bộ liên kết cũ. 
            # ORM sẽ tự động dò tìm và xóa sạch Parts, Groups, Questions rác dưới DB.
            test.parts = [] 
            db.flush()

            # 🔥 BƯỚC 2: Tạo dữ liệu mới theo dạng "Cây" (Tree)
            new_parts = []
            for p_data in test_in.parts:
                # Chú ý: KHÔNG CẦN truyền test_id vào nữa, SQLAlchemy sẽ tự lo!
                db_part = models.AptisReadingPart(
                    part_number=p_data.part_number,
                    title=p_data.title,
                    content=p_data.content
                )

                for g_data in p_data.groups:
                    # KHÔNG CẦN truyền part_id
                    db_group = models.AptisReadingQuestionGroup(
                        instruction=g_data.instruction,
                        image_url=g_data.image_url,
                        order=g_data.order
                    )

                    for q_data in g_data.questions:
                        # KHÔNG CẦN truyền group_id
                        db_question = models.AptisReadingQuestion(
                            question_number=q_data.question_number,
                            question_text=q_data.question_text,
                            question_type=q_data.question_type,
                            options=q_data.options,
                            correct_answer=q_data.correct_answer,
                            explanation=q_data.explanation
                        )
                        # Gắn Question vào Group
                        db_group.questions.append(db_question) 

                    # Gắn Group vào Part
                    db_part.groups.append(db_group) 
                
                # Đưa Part hoàn chỉnh vào danh sách chờ
                new_parts.append(db_part)

            # 🔥 BƯỚC 3: Gắn nguyên "Cây" mới vào Test
            test.parts = new_parts

        # 4. Lưu lại toàn bộ cục diện
        db.commit()
        return AptisReadingService.get_full_test_data(db, test.id)

    @staticmethod
    def get_all_tests(db: Session, current_user_id: Optional[int] = None, skip: int = 0, limit: int = 100, admin_view: bool = False, fetch_mock_only: bool = False):
        query = db.query(models.AptisReadingTest)
        
        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.AptisReadingTest.is_full_test_only == True)
            tests = query.order_by(models.AptisReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            return [schemas.TestListItem.model_validate(t) for t in tests]
        else:
            query = query.filter(
                models.AptisReadingTest.is_published == True,
                models.AptisReadingTest.is_full_test_only == False 
            )
            tests = query.order_by(models.AptisReadingTest.created_at.desc()).offset(skip).limit(limit).all()
            
            result_list = []
            for test in tests:
                status = "NOT_STARTED"
                if current_user_id:
                    latest_sub = db.query(models.AptisReadingSubmission).filter(
                        models.AptisReadingSubmission.test_id == test.id,
                        models.AptisReadingSubmission.user_id == current_user_id,
                        models.AptisReadingSubmission.is_full_test_only == False
                    ).order_by(models.AptisReadingSubmission.submitted_at.desc()).first()
                    
                    if latest_sub:
                        status = latest_sub.status
                
                test_dict = schemas.TestListItem.model_validate(test).model_dump()
                test_dict['status'] = status
                result_list.append(test_dict)
                
            return result_list

    @staticmethod
    def get_full_test_data(db: Session, test_id: int):
        return db.query(models.AptisReadingTest).options(
            joinedload(models.AptisReadingTest.parts)
            .joinedload(models.AptisReadingPart.groups)
            .joinedload(models.AptisReadingQuestionGroup.questions)
        ).filter(models.AptisReadingTest.id == test_id).first()
    
    get_test_detail = get_full_test_data

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = db.query(models.AptisReadingTest).filter(models.AptisReadingTest.id == test_id).first()
        if not test: return False
        db.delete(test)
        db.commit()
        return True

    # =======================================================
    # 🏆 SUBMISSION LOGIC (USER - PRACTICE MODE)
    # =======================================================
    @staticmethod
    def submit_test(db: Session, user_id: int, submission_data: schemas.StudentSubmissionRequest):
        test = AptisReadingService.get_full_test_data(db, submission_data.test_id)
        if not test: return None

        all_questions = []
        for part in test.parts:
            for group in part.groups:
                all_questions.extend(group.questions)

        all_questions.sort(key=lambda x: x.question_number)
        correct_count = 0
        answers_to_store = submission_data.answers or {}
        detailed_results = []
        
        for q in all_questions:
            q_id_str = str(q.id)
            q_num_str = str(q.question_number)
            user_ans = answers_to_store.get(q_id_str)
            if user_ans is None:
                user_ans = answers_to_store.get(q_num_str, "")
            
            # Logic chấm điểm chuỗi (Giữ nguyên từ IELTS vì rất tốt)
            cleaned_student = AptisReadingService.clean_text(user_ans)
            cleaned_correct = AptisReadingService.clean_text(q.correct_answer)
            
            # Cho phép đáp án có nhiều lựa chọn, cách nhau bởi dấu | hoặc / (VD: "A | B")
            accepted_answers = [ans.strip() for ans in cleaned_correct.replace('|', '/').split('/')]
            is_correct = cleaned_student in accepted_answers

            if is_correct: correct_count += 1

            detailed_results.append({
                "id": q.id, 
                "question_number": q.question_number,
                "question_text": q.question_text,
                "user_answer": user_ans,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation
            })

        # Quy đổi CEFR
        scoring_result = AptisReadingService.calculate_aptis_score_and_cefr(correct_count, len(all_questions))
        
        db_submission = models.AptisReadingSubmission(
            user_id=user_id,
            test_id=test.id,
            user_answers=answers_to_store,
            correct_count=correct_count,
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
            test={"id": test.id, "title": test.title, "description": test.description}, # 🔥 ĐÃ THÊM
            user_id=db_submission.user_id,
            status=db_submission.status,
            is_full_test_only=db_submission.is_full_test_only,
            
            correct_count=db_submission.correct_count,
            score=db_submission.score,
            cefr_level=db_submission.cefr_level,
            total_questions=len(all_questions),
            
            submitted_at=db_submission.submitted_at,
            user_answers=db_submission.user_answers,
            results=detailed_results
        )

    # =======================================================
    # 📜 HISTORY & ADMIN SUBMISSIONS
    # =======================================================
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
                test={"id": test.id, "title": test.title, "description": test.description}, # 🔥 ĐÃ THÊM
                status=sub.status,
                is_full_test_only=sub.is_full_test_only,
                
                correct_count=sub.correct_count,
                score=sub.score,
                cefr_level=sub.cefr_level,
                total_questions=25, # Chuẩn Aptis
                
                submitted_at=sub.submitted_at
            ) for sub, test in results
        ]

    @staticmethod
    def get_submission_detail(db: Session, submission_id: int):
        submission = db.query(models.AptisReadingSubmission).filter(models.AptisReadingSubmission.id == submission_id).first()
        if not submission: return None
        
        test = AptisReadingService.get_full_test_data(db, submission.test_id)
        
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
            
            cleaned_student = AptisReadingService.clean_text(student_ans)
            cleaned_correct = AptisReadingService.clean_text(q.correct_answer)
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
            test={"id": test.id, "title": test.title, "description": test.description} if test else None, # 🔥 ĐÃ THÊM
            user_id=submission.user_id,
            status=submission.status,
            is_full_test_only=submission.is_full_test_only,
            
            correct_count=submission.correct_count,
            score=submission.score,
            cefr_level=submission.cefr_level,
            total_questions=len(all_questions),
            
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
                    test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, # 🔥 ĐÃ THÊM
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    
                    correct_count=sub.correct_count,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    total_questions=25,
                    
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
                    test={"id": sub.test.id, "title": sub.test.title, "description": sub.test.description} if sub.test else None, # 🔥 ĐÃ THÊM
                    user_id=sub.user_id,
                    status=sub.status,
                    is_full_test_only=sub.is_full_test_only,
                    user=schemas.UserBasicInfo.model_validate(sub.user) if sub.user else None,
                    
                    correct_count=sub.correct_count,
                    score=sub.score,
                    cefr_level=sub.cefr_level,
                    total_questions=25,
                    
                    submitted_at=sub.submitted_at,
                    user_answers={},
                    results=[]
                )
            )
        return results

    @staticmethod
    def override_submission_score(db: Session, submission_id: int, req: schemas.ReadingScoreOverrideRequest):
        sub = db.query(models.AptisReadingSubmission).filter(models.AptisReadingSubmission.id == submission_id).first()
        if not sub:
            return None
            
        sub.score = req.score
        if req.correct_count is not None:
            sub.correct_count = req.correct_count 
        if req.cefr_level is not None:
            sub.cefr_level = req.cefr_level

        db.commit()
        return AptisReadingService.get_submission_detail(db, submission_id)