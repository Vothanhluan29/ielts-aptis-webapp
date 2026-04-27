from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user

from app.modules.APTIS.speaking import  schemas
from app.modules.APTIS.speaking.models import AptisSpeakingStatus

from app.modules.APTIS.speaking.services.utils import AptisSpeakingUtils
from app.modules.APTIS.speaking.services.test_service import AptisSpeakingTestService
from app.modules.APTIS.speaking.services.submission_service import AptisSpeakingSubmissionService

router = APIRouter(prefix="/aptis/speaking", tags=["Aptis Speaking"])

# =================================================================
# 1. UPLOAD AUDIO & IMAGE
# =================================================================
@router.post("/upload")
async def upload_aptis_audio_file(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):

    if not file.content_type.startswith("audio/") and not file.content_type == "application/octet-stream":
        pass

    public_url = await AptisSpeakingUtils.save_audio_file(file)
    if not public_url:
        raise HTTPException(status_code=500, detail="Failed to save audio file")
    return {"url": public_url}


@router.post("/admin/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_aptis_image(
    file: UploadFile = File(...),
    admin = Depends(get_admin_user)
):
    """Upload image files (Part 2, 3, 4)."""
    try:
        url = await AptisSpeakingUtils.upload_image(file)
        if not url:
            raise HTTPException(status_code=500, detail="Failed to save image")
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =================================================================
# 2. ADMIN: CRUD TEST (Prefix: /admin)
# =================================================================

@router.get("/admin/tests", response_model=List[schemas.AptisSpeakingTestListItem])
def get_aptis_tests_for_admin(
    is_mock_selector: bool = Query(False, description="Filter mock-only tests"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisSpeakingTestService.get_all_tests(db, admin_view=True, fetch_mock_only=is_mock_selector)


@router.post("/admin/tests", response_model=schemas.AptisSpeakingTestResponse, status_code=status.HTTP_201_CREATED)
def create_aptis_test(
    test_in: schemas.AptisSpeakingTestCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisSpeakingTestService.create_test(db, test_in)


@router.put("/admin/tests/{test_id}", response_model=schemas.AptisSpeakingTestResponse)
def update_aptis_test(
    test_id: int,
    test_in: schemas.AptisSpeakingTestUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    test = AptisSpeakingTestService.update_test(db, test_id, test_in)
    if not test:
        raise HTTPException(404, detail="Test not found")
    return test


@router.delete("/admin/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_aptis_test(
    test_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    try:
        if not AptisSpeakingTestService.delete_test(db, test_id):
            raise HTTPException(404, detail="Test not found")
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this test because it is assigned to a Full Mock Test."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None


# =================================================================
# 3. PUBLIC: LIST TESTS (Student View)
# =================================================================
@router.get("/tests", response_model=List[schemas.AptisSpeakingTestListItem])
def get_aptis_public_tests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return AptisSpeakingTestService.get_all_tests(
        db,
        current_user_id=current_user.id,
        skip=skip,
        limit=limit,
        admin_view=False,
        fetch_mock_only=False
    )


@router.get("/tests/{test_id}", response_model=schemas.AptisSpeakingTestResponse)
def get_aptis_test_detail(
    test_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    test = AptisSpeakingTestService.get_test_detail(db, test_id)
    if not test:
        raise HTTPException(404, detail="Test not found")

    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"

    if not test.is_published and not is_admin and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="This test has not been published yet.")

    return test


# =================================================================
# 4. USER
# =================================================================
@router.post("/save-part")
def save_aptis_speaking_part(
    request: schemas.SaveAptisSpeakingPartRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    submission = AptisSpeakingSubmissionService.save_part_submission(db, user.id, request)
    return {"submission_id": submission.id}


@router.post("/finish/{submission_id}", response_model=schemas.AptisSpeakingSubmissionResponse)
def finish_aptis_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    sub = AptisSpeakingSubmissionService.finish_test(db, submission_id, user.id)
    return sub


# =================================================================
# 5. USER: HISTORY & RESULTS
# =================================================================
@router.get("/submissions/me", response_model=List[schemas.AptisSpeakingSubmissionResponse])
def get_my_aptis_history(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return AptisSpeakingSubmissionService.get_user_history(db, user.id)


@router.get("/submissions/{submission_id}", response_model=schemas.AdminAptisSpeakingSubmissionDetailResponse)
def get_aptis_submission_detail(
    submission_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    sub = AptisSpeakingSubmissionService.get_submission_detail(db, submission_id)
    if not sub:
        raise HTTPException(404, detail="Submission not found")

    user_role = str(getattr(user, "role", "")).upper()
    is_admin = user_role == "ADMIN"

    if not is_admin and sub.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")

    return sub


# =================================================================
# 6. ADMIN: SUBMISSION MANAGEMENT (MANUAL GRADING)
# =================================================================

@router.get("/admin/submissions", response_model=schemas.AdminAptisSpeakingPagingResponse)
def admin_get_all_aptis_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by submission status (PENDING, GRADED)"),
    is_full_test_only: Optional[bool] = Query(False, description="Filter submissions by Full Mock Test type"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Retrieve submission list for table display (with pagination)"""
    return AptisSpeakingSubmissionService.get_all_submissions_for_admin(db, skip, limit, is_full_test_only, status)


@router.get("/admin/users/{target_user_id}/submissions", response_model=List[schemas.AdminAptisSpeakingSubmissionListResponse])
def admin_get_user_aptis_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return AptisSpeakingSubmissionService.get_user_history_for_admin(db, target_user_id)


@router.put("/admin/submissions/{submission_id}/grade", response_model=schemas.AdminAptisSpeakingSubmissionDetailResponse)
def admin_grade_submission(
    submission_id: int,
    req: schemas.SpeakingGradeRequest,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """[ADMIN] Teacher listens to audio and manually grades each part"""
    sub = AptisSpeakingSubmissionService.grade_submission(db, submission_id, admin.id, req)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub