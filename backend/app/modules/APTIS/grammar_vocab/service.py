import json
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime

from app.modules.APTIS.grammar_vocab import schemas, models

class GrammarVocabService:

    # =====================================================
    # 1. TEST MANAGEMENT (ADMIN)
    # =====================================================
    @staticmethod
    def create_test(
        db: Session,
        test_data: schemas.TestCreate
    ) -> models.AptisGrammarVocabTest:
        # 1. Tạo bản ghi Test cơ bản
        db_test = models.AptisGrammarVocabTest(
            title=test_data.title,
            description=test_data.description, # 🔥 ĐÃ THÊM
            time_limit=test_data.time_limit,
            is_published=test_data.is_published,
            is_full_test_only=test_data.is_full_test_only
        )

        db.add(db_test)
        db.flush()  # Ép database tạo ID cho db_test ngay lập tức

        # 2. Lưu danh sách câu hỏi (nếu có)
        if test_data.questions:
            db_questions = [
                models.AptisGrammarVocabQuestion(
                    test_id=db_test.id,
                    **q.model_dump()
                )
                for q in test_data.questions
            ]
            # Dùng add_all thay vì bulk_save_objects để Session nhận diện được object
            db.add_all(db_questions)

        db.commit()
        
        # 3. Query lại test từ đầu để load đầy đủ cả Test lẫn mảng Questions trả về cho Frontend
        return GrammarVocabService.get_test_detail_admin(db, db_test.id)

    @staticmethod
    def get_all_tests(
        db: Session,
        current_user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        admin_view: bool = False,
        fetch_mock_only: bool = False
    ):
        query = db.query(models.AptisGrammarVocabTest)

        if admin_view:
            if fetch_mock_only:
                query = query.filter(models.AptisGrammarVocabTest.is_full_test_only == True)
        else:
            query = query.filter(
                models.AptisGrammarVocabTest.is_published == True,
                models.AptisGrammarVocabTest.is_full_test_only == False
            )

        tests = query.order_by(models.AptisGrammarVocabTest.created_at.desc()).offset(skip).limit(limit).all()

        result_list = []
        for test in tests:
            status_val = models.AptisGrammarVocabStatus.NOT_STARTED
            
            if current_user_id:
                latest_sub = db.query(models.AptisGrammarVocabSubmission).filter(
                    models.AptisGrammarVocabSubmission.test_id == test.id,
                    models.AptisGrammarVocabSubmission.user_id == current_user_id,
                    models.AptisGrammarVocabSubmission.is_full_test_only == False
                ).order_by(models.AptisGrammarVocabSubmission.submitted_at.desc()).first()

                if latest_sub:
                    status_val = latest_sub.status 

            test_dict = schemas.TestListItem.model_validate(test).model_dump()
            test_dict['status'] = status_val
            result_list.append(test_dict)

        return result_list

    @staticmethod
    def get_test_detail_admin(
        db: Session,
        test_id: int
    ) -> models.AptisGrammarVocabTest:
        test = (
            db.query(models.AptisGrammarVocabTest)
            .options(joinedload(models.AptisGrammarVocabTest.questions))
            .filter(models.AptisGrammarVocabTest.id == test_id)
            .first()
        )

        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        return test

    @staticmethod
    def update_test(
        db: Session,
        test_id: int,
        test_data: schemas.TestUpdate
    ) -> models.AptisGrammarVocabTest:
        test = GrammarVocabService.get_test_detail_admin(db, test_id)

        # 1. Cập nhật thông tin cơ bản của Test
        update_data = test_data.model_dump(exclude_unset=True, exclude={"questions"})
        for key, value in update_data.items():
            setattr(test, key, value)

        # 🔥 ĐẢM BẢO CẬP NHẬT TRỰC TIẾP TRƯỜNG HỢP MÔ TẢ ĐƯỢC CHỈNH SỬA
        if test_data.description is not None:
            test.description = test_data.description

        # 2. Xóa toàn bộ câu hỏi cũ và lưu câu hỏi mới (Document-based update)
        if test_data.questions is not None:
            # Xóa data cũ cực nhanh với synchronize_session=False
            db.query(models.AptisGrammarVocabQuestion).filter(
                models.AptisGrammarVocabQuestion.test_id == test_id
            ).delete(synchronize_session=False)
            
            db.flush() # Đẩy lệnh Xóa xuống DB ngay lập tức
            
            # Thêm câu hỏi mới bằng db.add() 
            for q in test_data.questions:
                db_q = models.AptisGrammarVocabQuestion(
                    test_id=test_id,
                    **q.model_dump()
                )
                db.add(db_q)

        db.commit()
        
        # 3. Query lại test từ đầu để reload danh sách câu hỏi mới thêm
        return GrammarVocabService.get_test_detail_admin(db, test_id)

    @staticmethod
    def delete_test(db: Session, test_id: int):
        test = GrammarVocabService.get_test_detail_admin(db, test_id)
        db.delete(test)
        db.commit()
        return {"message": "Test deleted successfully"}


    # =====================================================
    # 2. USER FEATURES (TAKE TEST & SCORING)
    # =====================================================

    @staticmethod
    def get_test_for_user(
        db: Session,
        test_id: int
    ) -> models.AptisGrammarVocabTest:
        test = (
            db.query(models.AptisGrammarVocabTest)
            .options(joinedload(models.AptisGrammarVocabTest.questions))
            .filter(
                models.AptisGrammarVocabTest.id == test_id,
                models.AptisGrammarVocabTest.is_published == True
            )
            .first()
        )

        if not test:
            raise HTTPException(status_code=404, detail="Test not found or not published")
        return test

    @staticmethod
    def submit_test(
        db: Session,
        user_id: int,
        submission_data: schemas.SubmissionCreate
    ) -> models.AptisGrammarVocabSubmission:
        test = (
            db.query(models.AptisGrammarVocabTest)
            .options(joinedload(models.AptisGrammarVocabTest.questions))
            .filter(models.AptisGrammarVocabTest.id == submission_data.test_id)
            .first()
        )

        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        grammar_score = 0
        vocab_score = 0
        answer_details = {}

        for question in test.questions:
            q_id = str(question.id)
            q_num = str(question.question_number)

            user_choice = submission_data.user_answers.get(q_id)
            if user_choice is None:
                user_choice = submission_data.user_answers.get(q_num)
            
            is_correct = False

            # 🔥 SMART SCORING LOGIC BẮT ĐẦU Ở ĐÂY
            if user_choice is not None and question.correct_answer is not None:
                user_key_str = str(user_choice).strip().upper()
                correct_raw_str = str(question.correct_answer).strip().upper()

                # Trường hợp 1: Backend nhận Key "B" và DB lưu Key "B", HOẶC nhận "goes" và DB lưu "goes"
                if user_key_str == correct_raw_str:
                    is_correct = True
                else:
                    # Trường hợp 2: Tra cứu lấy Value từ Dictionary options
                    options = question.options
                    
                    # An toàn: Parse dict nếu options đang bị lưu dưới dạng string JSON trong DB
                    if isinstance(options, str):
                        try:
                            options = json.loads(options)
                        except:
                            options = {}

                    if isinstance(options, dict):
                        # Lấy giá trị của option (VD: option "B" có giá trị là "goes")
                        # Thử lấy bằng key gốc hoặc key đã viết hoa
                        mapped_value = options.get(user_choice) or options.get(user_key_str)
                        
                        if mapped_value and str(mapped_value).strip().upper() == correct_raw_str:
                            is_correct = True

            # CỘNG ĐIỂM
            if is_correct:
                # Lưu ý: Cần import Enum AptisQuestionPart hoặc gọi str value tuỳ vào model của bạn
                # Đảm bảo question.part_type (nếu là enum) được so sánh đúng
                part_type_val = question.part_type.value if hasattr(question.part_type, 'value') else str(question.part_type)
                if "GRAMMAR" in part_type_val.upper():
                    grammar_score += 1
                else:
                    vocab_score += 1

            # LƯU CHI TIẾT
            answer_details[q_id] = {
                "question_id": question.id,
                "part_type": question.part_type.value if hasattr(question.part_type, 'value') else question.part_type,
                "user_choice": user_choice,
                "correct_answer": question.correct_answer,
                "is_correct": is_correct,
                "explanation": question.explanation,
            }

        total_score = grammar_score + vocab_score

        db_submission = models.AptisGrammarVocabSubmission(
            user_id=user_id,
            test_id=test.id,
            grammar_score=grammar_score,
            vocab_score=vocab_score,
            total_score=total_score,
            status=models.AptisGrammarVocabStatus.GRADED, 
            is_full_test_only=submission_data.is_full_test_only, 
            user_answers=submission_data.user_answers,
            answer_details=answer_details,
            submitted_at=datetime.now()
        )

        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)

        return db_submission

    @staticmethod
    def get_user_history(db: Session, user_id: int):
        return db.query(models.AptisGrammarVocabSubmission).options(
            joinedload(models.AptisGrammarVocabSubmission.test)
        ).filter(
            models.AptisGrammarVocabSubmission.user_id == user_id, 
            models.AptisGrammarVocabSubmission.is_full_test_only == False
        ).order_by(models.AptisGrammarVocabSubmission.submitted_at.desc()).all()
    
    @staticmethod
    def get_submission_detail(db: Session, sub_id: int):
        return db.query(models.AptisGrammarVocabSubmission).options(
            joinedload(models.AptisGrammarVocabSubmission.test).joinedload(models.AptisGrammarVocabTest.questions)
        ).filter(models.AptisGrammarVocabSubmission.id == sub_id).first()