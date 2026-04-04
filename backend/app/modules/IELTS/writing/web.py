from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.modules.IELTS.writing import schemas

from app.modules.IELTS.writing.services.utils import WritingUtils
from app.modules.IELTS.writing.services.test_service import WritingTestService
from app.modules.IELTS.writing.services.submission_service import WritingSubmissionService
from app.modules.IELTS.writing.services.grading_service import WritingGradingService

router = APIRouter(prefix="/writing", tags=["Writing"])


@router.post("/admin/upload-image", status_code=status.HTTP_201_CREATED)
def upload_image(
    file: UploadFile = File(...),
    admin = Depends(get_admin_user)
):
    try:
        url = WritingUtils.upload_image(file)
        if not url:
             raise HTTPException(status_code=500, detail="Failed to save image")
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admin/tests", response_model=schemas.WritingTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: schemas.WritingTestCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return WritingTestService.create_test(db, test_in)


@router.put("/admin/tests/{test_id}", response_model=schemas.WritingTestResponse)
def update_test(
    test_id: int,
    test_in: schemas.WritingTestUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    test = WritingTestService.update_test(db, test_id, test_in)
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
        if not WritingTestService.delete_test(db, test_id):
            raise HTTPException(status_code=404, detail="Test not found")
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this test because it is currently assigned to a Full Mock Test."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None


@router.get("/admin/tests", response_model=List[schemas.WritingTestListItem])
def get_tests_for_admin(
    skip: int = 0,
    limit: int = 100,
    is_mock_selector: bool = Query(False, description="If True: return only mock tests for full test assembly"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return WritingTestService.get_all_tests(
        db,
        skip=skip,
        limit=limit,
        admin_view=True,
        fetch_mock_only=is_mock_selector
    )


@router.get("/tests", response_model=List[schemas.WritingTestListItem])
def get_public_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return WritingTestService.get_all_tests(
        db,
        admin_view=False,
        current_user_id=current_user.id,
        limit=limit,
        skip=skip,
        fetch_mock_only=False
    )


@router.get("/tests/{test_id}", response_model=schemas.WritingTestResponse)
def get_test_detail(
    test_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    test = WritingTestService.get_test_detail(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"

    if not test.is_published and not is_admin and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="This test has not been published yet.")

    return test


@router.post("/submit", response_model=schemas.WritingSubmissionResponse)
def submit_test(
    bg_tasks: BackgroundTasks,
    submission: schemas.SubmitWriting,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    new_sub = WritingSubmissionService.create_submission(db, user.id, submission)
    bg_tasks.add_task(WritingGradingService.process_ai_grading, new_sub.id)
    return new_sub


@router.get("/submissions/me", response_model=List[schemas.WritingSubmissionResponse])
def get_my_history(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return WritingSubmissionService.get_user_history(db, user.id)


@router.get("/submissions/{submission_id}", response_model=schemas.WritingSubmissionResponse)
def get_submission_detail(
    submission_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    sub = WritingSubmissionService.get_submission_detail(db, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    user_role = str(getattr(user, "role", "")).upper()
    is_admin = user_role == "ADMIN"

    if not is_admin and sub.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")

    return sub


@router.get("/admin/submissions")
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by submission status"),
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return WritingSubmissionService.get_all_submissions_for_admin(db, skip, limit, status)


@router.get("/admin/users/{target_user_id}/submissions", response_model=List[schemas.AdminWritingSubmissionResponse])
def admin_get_user_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    return WritingSubmissionService.get_user_history_for_admin(db, target_user_id)