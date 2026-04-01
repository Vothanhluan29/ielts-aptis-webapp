from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError 

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.modules.IELTS.listening import schemas
from app.modules.IELTS.listening.service import ListeningService

router = APIRouter(prefix="/listening", tags=["Listening"])

# ====================================================
# 1. UPLOAD AUDIO FILE (ADMIN ONLY)
# ====================================================
@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_audio(
    file: UploadFile = File(...), 
    admin = Depends(get_admin_user)
):
    """
    [ADMIN] Upload file MP3 cho bài nghe.
    Trả về: {"url": "http://domain/static/audio/filename.mp3"}
    """
    try:
        # Lưu ý: Bạn cần đảm bảo hàm save_audio_file đã được định nghĩa trong Service 
        # (Ví dụ: lưu vào AWS S3 hoặc thư mục static)
        url = ListeningService.save_audio_file(file)
        return {"url": url}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")
    
@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
def upload_image(
    file: UploadFile = File(...), 
    admin = Depends(get_admin_user)
):
    """
    [ADMIN] Upload file Hình ảnh (JPG, PNG, SVG...) cho dạng Map/Diagram Labeling.
    Trả về: {"url": "/static/images/filename.png"}
    """
    try:
        url = ListeningService.save_image_file(file)
        return {"url": url}
    except ValueError as ve:
        # Bắt lỗi ValueError từ Service (Ví dụ: Sai định dạng file)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# ====================================================
# 2. QUẢN LÝ TEST (ADMIN) - CRUD
# ====================================================

@router.get("/admin/tests", response_model=List[schemas.ListeningTestListItem])
def get_tests_for_admin(
    skip: int = 0,
    limit: int = 100,
    is_mock_selector: bool = Query(False, description="Nếu True: Chỉ lấy bài Mock để ghép đề"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """Lấy danh sách tất cả bài thi (kể cả chưa publish)"""
    return ListeningService.get_all_tests(
        db, 
        admin_view=True, 
        fetch_mock_only=is_mock_selector
    )

@router.post("/admin/tests", response_model=schemas.ListeningTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_data: schemas.ListeningTestCreateOrUpdate, # 🔥 Đã đồng bộ Schema
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """Tạo đề thi mới (Kèm Parts -> Groups -> Questions)"""
    return ListeningService.create_test(db, test_data)

@router.get("/admin/tests/{test_id}", response_model=schemas.ListeningTestResponse)
def get_test_detail_admin(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    """Lấy chi tiết đề thi (Bao gồm đáp án đúng để Admin sửa)"""
    test = ListeningService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.patch("/admin/tests/{test_id}", response_model=schemas.ListeningTestResponse)
def update_test(
    test_id: int,
    test_data: schemas.ListeningTestCreateOrUpdate, # 🔥 Đã đồng bộ Schema
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """Cập nhật đề thi (Deep Update: Xóa cũ tạo mới các phần con)"""
    test = ListeningService.update_test(db, test_id, test_data)
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
        if not ListeningService.delete_test(db, test_id):
            raise HTTPException(status_code=404, detail="Test not found")
    except IntegrityError:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this test because it is currently assigned to a Full Mock Test."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None 

# ====================================================
# 3. PUBLIC / STUDENT API (Practice Mode)
# ====================================================

@router.get("/tests", response_model=List[schemas.ListeningTestListItem]) 
def get_public_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    [STUDENT] Lấy danh sách bài thi luyện tập.
    """
    return ListeningService.get_all_tests(
        db, 
        current_user_id=current_user.id,
        skip=skip,
        limit=limit,
        admin_view=False,
        fetch_mock_only=False
    )

@router.get("/tests/{test_id}", response_model=schemas.ListeningTestStudent)
def get_test_detail_for_student(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    [STUDENT] Lấy đề để làm bài.
    """
    test = ListeningService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Check quyền Admin an toàn
    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not is_admin and not test.is_published and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="Test is not published yet.")

    return test

@router.post("/submit", response_model=schemas.SubmissionDetail)
def submit_test(
    submission: schemas.SubmitAnswer, 
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Nộp bài và chấm điểm ngay lập tức"""
    result = ListeningService.submit_test(db, user.id, submission)
    if not result: 
        raise HTTPException(status_code=400, detail="Submission failed")
    return result

# ====================================================
# 4. USER HISTORY
# ====================================================

@router.get("/submissions/me", response_model=List[schemas.SubmissionSummary])
def get_my_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    # 🔥 FIX: Đổi tên hàm cho khớp với service.py
    return ListeningService.get_student_history(db, user.id)

@router.get("/submissions/{submission_id}", response_model=schemas.SubmissionDetail)
def get_submission_detail(
    submission_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    """Xem lại chi tiết kết quả bài đã làm"""
    sub = ListeningService.get_submission_detail(db, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    user_role = str(getattr(user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not is_admin and sub.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return sub

# ====================================================
# 5. ADMIN: SUBMISSION MANAGEMENT
# ====================================================

@router.get("/admin/submissions", response_model=List[schemas.AdminListeningSubmissionResponse])
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái bài nộp"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Lấy danh sách tất cả bài nộp Listening của hệ thống"""
    return ListeningService.get_all_submissions_for_admin(db, skip, limit, status)

@router.get("/admin/users/{target_user_id}/submissions", response_model=List[schemas.AdminListeningSubmissionResponse])
def admin_get_user_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Xem lịch sử bài nộp Listening của 1 học viên"""
    return ListeningService.get_user_history_for_admin(db, target_user_id)