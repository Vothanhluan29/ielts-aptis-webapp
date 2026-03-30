from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.modules.IELTS.speaking import schemas
from app.modules.IELTS.speaking.service import SpeakingService

router = APIRouter(prefix="/speaking", tags=["Speaking"])

# =================================================================
# 1. UPLOAD AUDIO (Dùng chung)
# =================================================================
@router.post("/upload")
def upload_audio_file(
    file: UploadFile = File(...),
    user = Depends(get_current_user) 
):
    """
    Upload file âm thanh (mp3, wav, webm...).
    Trả về URL để FE gửi kèm vào payload save-question.
    """
    # Chỉ cho phép file audio
    if not file.content_type.startswith("audio/") and not file.content_type == "application/octet-stream":
        raise HTTPException(status_code=400, detail="Invalid file type. Only audio files are allowed.")
         
    public_url = SpeakingService.save_audio_file(file)
    if not public_url:
        raise HTTPException(status_code=500, detail="Failed to save audio file")
    
    return {"url": public_url}


# =================================================================
# 2. ADMIN: CRUD TEST (Prefix: /admin)
# =================================================================
@router.get("/admin/tests", response_model=List[schemas.SpeakingTestListItem])
def get_tests_for_admin(
    is_mock_selector: bool = Query(False, description="Lọc bài Mock Only"), 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    return SpeakingService.get_all_tests(db, admin_view=True, fetch_mock_only=is_mock_selector)

@router.post("/admin/tests", response_model=schemas.SpeakingTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: schemas.SpeakingTestCreate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    return SpeakingService.create_test(db, test_in)

@router.put("/admin/tests/{test_id}", response_model=schemas.SpeakingTestResponse)
def update_test(
    test_id: int, 
    test_in: schemas.SpeakingTestUpdate, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    test = SpeakingService.update_test(db, test_id, test_in)
    if not test: raise HTTPException(404, detail="Test not found")
    return test

@router.delete("/admin/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):
    try:
        if not SpeakingService.delete_test(db, test_id): 
            raise HTTPException(404, detail="Test not found")
    except IntegrityError:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this test because it is currently assigned to a Full Mock Test. Please remove it from the Full Test first."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None


# =================================================================
# 3. PUBLIC: LIST TESTS (Student View)
# =================================================================
@router.get("/tests", response_model=List[schemas.SpeakingTestListItem])
def get_public_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Lấy danh sách bài thi Speaking (Practice Mode)"""
    return SpeakingService.get_all_tests(
        db, 
        current_user_id=current_user.id,
        skip=skip,
        limit=limit,
        admin_view=False,
        fetch_mock_only=False
    )

@router.get("/tests/{test_id}", response_model=schemas.SpeakingTestResponse)
def get_test_detail(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    test = SpeakingService.get_test_detail(db, test_id)
    if not test: raise HTTPException(404, detail="Test not found")
    
    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not test.is_published and not is_admin and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="Bài thi này chưa được công khai.")
        
    return test


# =================================================================
# 4. USER: CORE FLOW (Save Question -> Finish)
# =================================================================
@router.post("/save-question")
def save_speaking_question(
    request: schemas.SaveSpeakingQuestionRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Học viên nộp file ghi âm cho TỪNG CÂU HỎI"""
    submission = SpeakingService.save_question_submission(db, user.id, request)
    return {"submission_id": submission.id}

@router.post("/finish/{submission_id}", response_model=schemas.SpeakingSubmissionResponse)
def finish_submission(
    submission_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Học viên ấn nộp bài toàn bộ đề thi (Trigger AI chấm điểm)"""
    sub = SpeakingService.finish_test(db, submission_id, user.id)
    background_tasks.add_task(SpeakingService.process_ai_grading, sub.id)
    return sub


# =================================================================
# 5. USER: HISTORY & RESULTS
# =================================================================
@router.get("/submissions/me", response_model=List[schemas.SpeakingSubmissionResponse])
def get_my_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    return SpeakingService.get_user_history(db, user.id)

@router.get("/submissions/{submission_id}", response_model=schemas.SpeakingSubmissionResponse)
def get_submission_detail(
    submission_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    sub = SpeakingService.get_submission_detail(db, submission_id)
    if not sub: raise HTTPException(404, detail="Submission not found")
    
    user_role = str(getattr(user, "role", "")).upper()
    is_admin = user_role == "ADMIN"
    
    if not is_admin and sub.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")
        
    return sub


# =================================================================
# 6. ADMIN: SUBMISSION MANAGEMENT
# =================================================================

# 🔥 ĐÃ CẢI TIẾN: Hỗ trợ phân trang chuẩn cho Admin Dashboard
@router.get("/admin/submissions")
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[schemas.SpeakingStatus] = Query(None, description="Lọc theo trạng thái bài nộp"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Lấy danh sách bài nộp có phân trang"""
    items = SpeakingService.get_all_submissions_for_admin(db, skip, limit, status)
    # Tự động đóng gói thành dạng Paging để Frontend dễ xử lý
    return {
        "items": items,
        "total": len(items) # Lưu ý: Nếu data quá lớn, bạn nên viết thêm hàm count() trong service
    }

@router.get("/admin/users/{target_user_id}/submissions", response_model=List[schemas.AdminSpeakingSubmissionResponse])
def admin_get_user_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return SpeakingService.get_user_history_for_admin(db, target_user_id)
