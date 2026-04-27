from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError 

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user

from app.modules.APTIS.listening import schemas
from app.modules.APTIS.listening.services.utils import AptisListeningUtils
from app.modules.APTIS.listening.services.test_service import AptisListeningTestService
from app.modules.APTIS.listening.services.submission_service import AptisListeningSubmissionService

router = APIRouter(prefix="/aptis/listening", tags=["Aptis Listening"])

# ====================================================
# 1. UPLOAD AUDIO FILE (ADMIN ONLY)
# ====================================================
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_audio(
    file: UploadFile = File(...), 
    admin = Depends(get_admin_user)
):

    try:
        url = await AptisListeningUtils.save_audio_file(file)
        return {"url": url}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")


# ====================================================
# 2.  TEST (ADMIN) - CRUD
# ====================================================

@router.get("/admin/tests", response_model=List[schemas.ListeningTestListItem])
def get_tests_for_admin(
    skip: int = 0,
    limit: int = 100,
    is_mock_selector: bool = Query(False, description="Nếu True: Chỉ lấy bài Mock để ghép đề"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisListeningTestService.get_all_tests(
        db, 
        admin_view=True, 
        fetch_mock_only=is_mock_selector
    )

@router.post("/admin/tests", response_model=schemas.ListeningTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_data: schemas.ListeningTestCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisListeningTestService.create_test(db, test_data)

@router.get("/admin/tests/{test_id}", response_model=schemas.ListeningTestResponse)
def get_test_detail_admin(
    test_id: int, 
    db: Session = Depends(get_db), 
    admin = Depends(get_admin_user)
):

    test = AptisListeningTestService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.patch("/admin/tests/{test_id}", response_model=schemas.ListeningTestResponse)
def update_test(
    test_id: int,
    test_data: schemas.ListeningTestUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    test = AptisListeningTestService.update_test(db, test_id, test_data)
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
        if not AptisListeningTestService.delete_test(db, test_id):
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

    return AptisListeningTestService.get_all_tests(
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
  
    test = AptisListeningTestService.get_test_detail(db, test_id)
    if not test: 
        raise HTTPException(status_code=404, detail="Test not found")
    
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
    result = AptisListeningSubmissionService.submit_test(db, user.id, submission)
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
    return AptisListeningSubmissionService.get_my_submissions(db, user.id)

@router.get("/submissions/{submission_id}", response_model=schemas.SubmissionDetail)
def get_submission_detail(
    submission_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):

    sub = AptisListeningSubmissionService.get_submission_detail(db, submission_id)
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
    status: Optional[str] = Query(None, description="Filter by submission status"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    return AptisListeningSubmissionService.get_all_submissions_for_admin(db, skip, limit, status)

@router.get("/admin/users/{target_user_id}/submissions", response_model=List[schemas.AdminListeningSubmissionResponse])
def admin_get_user_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    return AptisListeningSubmissionService.get_user_history_for_admin(db, target_user_id)