from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional, Dict, Any

from app.core.database import get_db
# Đảm bảo import đúng từ file dependencies của bạn
from app.core.dependencies import get_current_user, get_admin_user 
from app.modules.IELTS.writing import schemas
from app.modules.IELTS.writing.service import WritingService

# Prefix chung là /writing
router = APIRouter(prefix="/writing", tags=["Writing"])

# ==================== 1. UPLOAD (ADMIN) ====================
# URL: /writing/admin/upload-image
@router.post("/admin/upload-image", status_code=status.HTTP_201_CREATED)
def upload_image(
    file: UploadFile = File(...), 
    admin = Depends(get_admin_user)
):
    try:
        url = WritingService.upload_image(file)
        if not url:
             raise HTTPException(status_code=500, detail="Failed to save image")
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== 2. TEST MANAGEMENT (ADMIN CRUD) ====================
# URL: /writing/admin/tests
@router.post("/admin/tests", response_model=schemas.WritingTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: schemas.WritingTestCreate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    return WritingService.create_test(db, test_in)

@router.put("/admin/tests/{test_id}", response_model=schemas.WritingTestResponse)
def update_test(
    test_id: int, 
    test_in: schemas.WritingTestUpdate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    test = WritingService.update_test(db, test_id, test_in)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.delete("/admin/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    try:
        if not WritingService.delete_test(db, test_id): 
            raise HTTPException(status_code=404, detail="Test not found")
    except IntegrityError:
        # Bắt lỗi khóa ngoại nếu đề thi này đang nằm trong đề thi Full Test
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this test because it is currently assigned to a Full Mock Test."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None


# ==================== 3. LIST VIEW (SPLIT: ADMIN vs STUDENT) ====================
# 👉 API 1: Dành cho ADMIN (Có quyền lọc Mock Test)
@router.get("/admin/tests", response_model=List[schemas.WritingTestListItem])
def get_tests_for_admin(
    skip: int = 0,
    limit: int = 100,
    is_mock_selector: bool = Query(False, description="Nếu True: Chỉ lấy bài Mock để ghép đề"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN ONLY] Lấy danh sách bài thi. Có thể lọc lấy riêng các bài Mock Test để thực hiện ghép đề Full."""
    return WritingService.get_all_tests(
        db, 
        skip = skip,
        limit = limit,
        admin_view=True, 
        fetch_mock_only=is_mock_selector
    )

# 👉 API 2: Dành cho STUDENT (Mặc định ẩn Mock Test)
@router.get("/tests", response_model=List[schemas.WritingTestListItem])
def get_public_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """[PUBLIC] Lấy danh sách bài luyện tập. Luôn ẨN bài Draft và bài Mock."""
    return WritingService.get_all_tests(
        db, 
        admin_view=False,
        current_user_id=current_user.id,
        limit= limit,
        skip = skip,
        fetch_mock_only=False
    )


# ==================== 4. PUBLIC / DETAIL VIEW ====================
@router.get("/tests/{test_id}", response_model=schemas.WritingTestResponse)
def get_test_detail(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) # ✅ Thêm user hiện tại
):
    test = WritingService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
        
    # ✅ ĐỒNG BỘ: Check quyền Admin an toàn để xem bài chưa publish
    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not test.is_published and not is_admin and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="Bài thi này chưa được công khai.")
        
    return test


# ==================== 5. SUBMISSION (NỘP BÀI) ====================
@router.post("/submit", response_model=schemas.WritingSubmissionResponse)
def submit_test(
    bg_tasks: BackgroundTasks,
    submission: schemas.SubmitWriting,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    User nộp bài Writing.
    Hệ thống sẽ lưu bài và kích hoạt Background Task để chấm điểm AI.
    """
    new_sub = WritingService.create_submission(db, user.id, submission)
    bg_tasks.add_task(WritingService.process_ai_grading, new_sub.id)
    return new_sub

@router.get("/submissions/me", response_model=List[schemas.WritingSubmissionResponse])
def get_my_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    return WritingService.get_user_history(db, user.id)

@router.get("/submissions/{submission_id}", response_model=schemas.WritingSubmissionResponse)
def get_submission_detail(
    submission_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    sub = WritingService.get_submission_detail(db, submission_id)
    if not sub: 
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # ✅ FIX LỖI 403 & ĐỒNG BỘ CÁC KỸ NĂNG KHÁC
    user_role = str(getattr(user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not is_admin and sub.user_id != user.id: 
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")
        
    return sub


# ==================== 6. ADMIN: SUBMISSION MANAGEMENT (NEW) ====================

# 🔥 CẬP NHẬT: Loại bỏ response_model cố định để hỗ trợ object phân trang (total, items)
@router.get("/admin/submissions")
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái bài nộp"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Dashboard Quản lý: Lấy danh sách tất cả bài nộp Writing có phân trang"""
    return WritingService.get_all_submissions_for_admin(db, skip, limit, status)

@router.get("/admin/users/{target_user_id}/submissions", response_model=List[schemas.AdminWritingSubmissionResponse])
def admin_get_user_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Xem lịch sử làm bài Writing của một học viên cụ thể"""
    return WritingService.get_user_history_for_admin(db, target_user_id)