from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user 

from app.modules.APTIS.grammar_vocab import schemas
from app.modules.APTIS.grammar_vocab.service import GrammarVocabService
router = APIRouter(prefix="/aptis/grammar-vocab", tags=["Aptis Grammar & Vocabulary"])

# =====================================================
# ADMIN: TEST MANAGEMENT
# =====================================================

@router.post("/admin/tests", response_model=schemas.TestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: schemas.TestCreate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    return GrammarVocabService.create_test(db, test_in)

@router.get("/admin/tests", response_model=List[schemas.TestListItem])
def get_tests_for_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    is_mock_selector: bool = Query(False, description="True: Chỉ lấy bài Mock để ghép đề Full"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Lấy danh sách đề thi. Hỗ trợ lọc bài Full Mock."""
    return GrammarVocabService.get_all_tests(
        db, 
        skip=skip, 
        limit=limit, 
        admin_view=True, 
        fetch_mock_only=is_mock_selector
    )

@router.get("/admin/tests/{test_id}", response_model=schemas.TestAdminDetailResponse)
def get_test_detail_admin(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    """[ADMIN] Xem chi tiết đề thi (Bao gồm cả đáp án đúng)"""
    return GrammarVocabService.get_test_detail_admin(db, test_id)

@router.put("/admin/tests/{test_id}", response_model=schemas.TestResponse)
def update_test(
    test_id: int, 
    test_in: schemas.TestUpdate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    return GrammarVocabService.update_test(db, test_id, test_in)

@router.delete("/admin/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    try:
        GrammarVocabService.delete_test(db, test_id)
    except IntegrityError:
        raise HTTPException(
            status_code=400, 
            detail="Không thể xóa vì đề thi này đang được gắn trong một bài Full Mock Test."
        )
    return None


# =====================================================
# 🎓 STUDENT: TAKE TEST & SUBMIT
# =====================================================

@router.get("/tests", response_model=List[schemas.TestListItem])
def get_public_tests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """[PUBLIC] Danh sách bài tập rèn luyện (Luôn ẨN bài Draft và bài Mock Test)"""
    return GrammarVocabService.get_all_tests(
        db, 
        current_user_id=current_user.id,
        skip=skip, 
        limit=limit, 
        admin_view=False
    )

@router.get("/tests/{test_id}", response_model=schemas.TestTakeResponse)
def get_test_detail_for_user(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """[PUBLIC] Học viên vào làm bài (Đã che giấu đáp án đúng)"""
    return GrammarVocabService.get_test_for_user(db, test_id)

@router.post("/submit", response_model=schemas.SubmissionResponse)
def submit_test(
    submission: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """[PUBLIC] Học viên nộp bài. Chấm điểm tức thì."""
    return GrammarVocabService.submit_test(db, user.id, submission)


# =====================================================
# 📜 STUDENT: HISTORY & RESULTS
# =====================================================

@router.get("/submissions/me", response_model=List[schemas.SubmissionHistoryItem])
def get_my_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    """[PUBLIC] Xem danh sách lịch sử làm bài (Gọn nhẹ)"""
    return GrammarVocabService.get_user_history(db, user.id)

@router.get("/submissions/{submission_id}", response_model=schemas.SubmissionResponse)
def get_submission_detail(
    submission_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    """[PUBLIC] Xem chi tiết kết quả một bài nộp"""
    sub = GrammarVocabService.get_submission_detail(db, submission_id)
    if not sub: 
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Bảo mật: Chỉ người nộp hoặc Admin mới được xem
    user_role = str(getattr(user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not is_admin and sub.user_id != user.id: 
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")
        
    return sub