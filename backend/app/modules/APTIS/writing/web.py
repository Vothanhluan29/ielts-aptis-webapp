from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user 

from app.modules.APTIS.writing import schemas
from app.modules.APTIS.writing.service import AptisWritingService

router = APIRouter(prefix="/aptis/writing", tags=["Aptis Writing"])

# =====================================================
# 🖼️ 1. UPLOAD (ADMIN ONLY)
# =====================================================

# @router.post("/admin/upload-image", status_code=status.HTTP_201_CREATED)
# def upload_image(
#     file: UploadFile = File(...), 
#     admin = Depends(get_admin_user)
# ):
#     try:
#         url = AptisWritingService.upload_image(file)
#         if not url:
#             raise HTTPException(status_code=500, detail="Failed to save image")
#         return {"url": url}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# 👑 2. TEST MANAGEMENT (ADMIN CRUD)
# =====================================================

@router.get("/admin/tests", response_model=List[schemas.WritingTestListItem])
def get_tests_for_admin(
    skip: int = 0,
    limit: int = 100,
    is_mock_selector: bool = Query(False, description="Nếu True: Chỉ lấy bài Mock để ghép đề"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisWritingService.get_all_tests(
        db, skip=skip, limit=limit, admin_view=True, fetch_mock_only=is_mock_selector
    )

@router.get("/admin/tests/{test_id}", response_model=schemas.WritingTestResponse)
def get_test_detail_for_admin(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    test = AptisWritingService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.post("/admin/tests", response_model=schemas.WritingTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: schemas.WritingTestCreate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    try:
        return AptisWritingService.create_test(db, test_in)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo đề thi: {str(e)}")

@router.put("/admin/tests/{test_id}", response_model=schemas.WritingTestResponse)
def update_test(
    test_id: int, 
    test_in: schemas.WritingTestUpdate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    try:
        test = AptisWritingService.update_test(db, test_id, test_in)
        if not test: 
            raise HTTPException(status_code=404, detail="Test not found")
        return test
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật đề thi: {str(e)}")

@router.delete("/admin/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    try:
        if not AptisWritingService.delete_test(db, test_id): 
            raise HTTPException(status_code=404, detail="Test not found")
    except IntegrityError:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this test because it is currently assigned to a Full Mock Test."
        )
    return


# =====================================================
# 🎓 3. STUDENT ROUTES (PUBLIC)
# =====================================================

@router.get("/tests", response_model=List[schemas.WritingTestListItem])
def get_public_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return AptisWritingService.get_all_tests(
        db, admin_view=False, current_user_id=current_user.id, limit=limit, skip=skip
    )

@router.get("/tests/{test_id}", response_model=schemas.WritingTestResponse)
def get_test_detail_public(
    test_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user) 
):
    test = AptisWritingService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    
    is_admin = str(getattr(current_user, "role", "")).upper() == "ADMIN"
    if not test.is_published and not is_admin and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="Bài thi này chưa được công khai.")
        
    return test


# =====================================================
# 📝 4. SUBMISSION (Học viên nộp bài)
# =====================================================

@router.post("/submit", response_model=schemas.WritingSubmissionResponse)
def submit_test(
    submission: schemas.SubmitWriting,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    new_sub = AptisWritingService.create_submission(db, user.id, submission)
    return new_sub

@router.get("/submissions/me", response_model=List[schemas.SubmissionHistoryItem])
def get_my_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    return AptisWritingService.get_user_history(db, user.id)

@router.get("/submissions/{submission_id}", response_model=schemas.WritingSubmissionDetailResponse)
def get_submission_detail(
    submission_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    sub = AptisWritingService.get_submission_detail(db, submission_id)
    if not sub: 
        raise HTTPException(status_code=404, detail="Submission not found")
    
    is_admin = str(getattr(user, "role", "")).upper() == "ADMIN"
    if not is_admin and sub.user_id != user.id: 
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return sub


# =====================================================
# 🏆 5. ADMIN: SUBMISSION MANAGEMENT & GRADING
# =====================================================

# 🔥 ĐÃ FIX: Xóa response_model=List[...] để trả về dict {total: int, items: list} từ service
@router.get("/admin/submissions")
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[schemas.SubmissionStatus] = Query(None),
    is_full_test_only: Optional[bool] = Query(False, description="Nếu True: Chỉ lấy submission của bài full mock"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisWritingService.get_all_submissions_for_admin(db, skip, limit, is_full_test_only, status)

@router.get("/admin/users/{user_id}/submissions", response_model=List[schemas.AdminWritingSubmissionResponse])
def admin_get_user_submissions(
    user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisWritingService.get_user_history_for_admin(db, user_id)

@router.put("/admin/submissions/{submission_id}/grade", response_model=schemas.AdminWritingSubmissionResponse)
def admin_grade_submission(
    submission_id: int,
    req: schemas.WritingGradeRequest,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    # Truyền thêm admin.id vào để lưu vết giáo viên chấm bài
    sub = AptisWritingService.grade_submission(db, submission_id, admin.id, req)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub