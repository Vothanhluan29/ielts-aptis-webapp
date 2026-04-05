from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user

from app.modules.APTIS.reading import schemas
from app.modules.APTIS.reading.services.test_service import AptisReadingTestService
from app.modules.APTIS.reading.services.submission_service import AptisReadingSubmissionService
router = APIRouter(prefix="/aptis/reading", tags=["Aptis Reading"])


# =====================================================
# ADMIN ROUTES
# =====================================================

@router.get("/admin/tests", response_model=List[schemas.TestListItem])
def get_all_tests_for_admin(
    skip: int = 0,
    limit: int = 100,
    is_mock_selector: bool = Query(False),
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    return AptisReadingTestService.get_all_tests(
        db,
        skip=skip,
        limit=limit,
        admin_view=True,
        fetch_mock_only=is_mock_selector,
    )


@router.post(
    "/admin/tests",
    response_model=schemas.TestAdmin,
    status_code=status.HTTP_201_CREATED,
)
def create_test(
    test_input: schemas.TestCreateOrUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    return AptisReadingTestService.create_test(db, test_input)


@router.get("/admin/tests/{test_id}", response_model=schemas.TestAdmin)
def get_test_for_admin(
    test_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    test = AptisReadingTestService.get_full_test_data(db, test_id)
    if not test:
        raise HTTPException(404, detail="Test not found")
    return test


@router.put("/admin/tests/{test_id}", response_model=schemas.TestAdmin)
def update_test(
    test_id: int,
    test_input: schemas.TestCreateOrUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    updated_test = AptisReadingTestService.update_test(db, test_id, test_input)
    if not updated_test:
        raise HTTPException(404, detail="Test not found")
    return updated_test


@router.delete("/admin/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    try:
        success = AptisReadingTestService.delete_test(db, test_id)
        if not success:
            raise HTTPException(404, detail="Not found")
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this test because it is currently assigned to a Full Mock Test.",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None


@router.get(
    "/admin/submissions",
    response_model=List[schemas.AdminReadingSubmissionResponse],
)
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    return AptisReadingSubmissionService.get_all_submissions_for_admin(db, skip, limit, status)


@router.get(
    "/admin/users/{target_user_id}/submissions",
    response_model=List[schemas.AdminReadingSubmissionResponse],
)
def admin_get_user_history(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user),
):
    return AptisReadingSubmissionService.get_user_history_for_admin(db, target_user_id)


# =====================================================
# 🎓 STUDENT ROUTES (Practice Mode)
# =====================================================

@router.get("/tests", response_model=List[schemas.TestListItem])
def get_all_public_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return AptisReadingTestService.get_all_tests(
        db,
        current_user_id=current_user.id,
        skip=skip,
        limit=limit,
        admin_view=False,
    )


@router.get("/tests/{test_id}", response_model=schemas.TestPublic)
def get_test_for_student(
    test_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    test = AptisReadingTestService.get_full_test_data(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"

    # Chặn không cho học viên xem đề chưa publish
    if not test.is_published and not is_admin and not test.is_full_test_only:
        raise HTTPException(status_code=403, detail="Bài thi này chưa được công khai.")

    return test


@router.post("/submit", response_model=schemas.SubmissionDetail)
def submit_test(
    submission_data: schemas.StudentSubmissionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = AptisReadingSubmissionService.submit_test(db, current_user.id, submission_data)
    if not result:
        raise HTTPException(status_code=400, detail="Submission failed")
    return result


# =====================================================
# 📜 HISTORY ROUTES
# =====================================================

@router.get("/submissions/me", response_model=List[schemas.SubmissionHistoryItem])
def get_my_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return AptisReadingSubmissionService.get_student_history(db, current_user.id)


@router.get("/submissions/{submission_id}", response_model=schemas.SubmissionDetail)
def get_submission_review(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = AptisReadingSubmissionService.get_submission_detail(db, submission_id)
    if not result:
        raise HTTPException(status_code=404, detail="Submission not found")

    user_role = str(getattr(current_user, "role", "")).upper()
    is_admin = user_role == "ADMIN"

    # Chỉ Admin hoặc chính chủ mới được xem lại bài nộp
    if not is_admin and result.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return result