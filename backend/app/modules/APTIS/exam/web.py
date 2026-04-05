from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.modules.users.models import User

# Import Schemas
from app.modules.APTIS.exam import schemas
from app.modules.APTIS.exam.services.test_service import AptisExamTestService
from app.modules.APTIS.exam.services.submission_service import AptisExamSubmissionService

# 🔥 Đổi prefix thành /aptis/exam để tách biệt với IELTS
router = APIRouter(prefix="/aptis/exam", tags=["Aptis Exam (Full Test)"])

# =========================
# 👑 ADMIN - FULL TEST
# =========================

@router.get("/admin/tests", response_model=List[schemas.AptisFullTestListItem]) 
def admin_get_all_tests(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    # Service trả về list các object đã được joinedload
    return AptisExamTestService.get_all_full_tests(db, admin_view=True)


@router.post("/admin/tests", response_model=schemas.AptisFullTestResponse)
def create_full_test(
    data: schemas.AptisFullTestCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return AptisExamTestService.create_full_test(db, data)


@router.get("/admin/tests/{test_id}", response_model=schemas.AptisFullTestResponse)
def get_test_detail_admin(
    test_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    test = AptisExamTestService.get_full_test_detail(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test


@router.put("/admin/tests/{test_id}", response_model=schemas.AptisFullTestResponse)
def update_full_test(
    test_id: int,
    data: schemas.AptisFullTestUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    updated = AptisExamTestService.update_full_test(db, test_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Test not found")
    return updated


@router.delete("/admin/tests/{test_id}")
def delete_full_test(
    test_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = AptisExamTestService.delete_full_test(db, test_id)
    if not success:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Deleted successfully"}


# =========================
# 📑 ADMIN - SUBMISSIONS
# =========================

@router.get(
    "/admin/submissions",
    response_model=schemas.AdminAptisExamPagingResponse, 
)
def admin_get_all_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return AptisExamSubmissionService.get_all_submissions_for_admin(db, skip, limit, status)


# =========================
# 🎓 STUDENT - TEST LIBRARY
# =========================

@router.get("/tests", response_model=List[schemas.AptisFullTestListItem])
def get_library_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AptisExamTestService.get_all_full_tests(
        db,
        admin_view=False,
        current_user_id=current_user.id,
    )


@router.get("/tests/{test_id}", response_model=schemas.AptisFullTestResponse)
def get_library_test_detail(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test = AptisExamTestService.get_full_test_detail(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    is_admin = str(getattr(current_user, "role", "")).upper() == "ADMIN"
    if not is_admin and not test.is_published:
        raise HTTPException(status_code=403, detail="Test is not published")

    return test


# =========================
# 🚀 STUDENT - EXAM FLOW
# =========================

@router.post("/start", response_model=schemas.AptisExamSubmissionResponse)
def start_exam(
    payload: schemas.StartAptisExamRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AptisExamSubmissionService.start_exam(
        db,
        current_user.id,
        payload.full_test_id,
    )


@router.get(
    "/current/{submission_id}",
    response_model=schemas.AptisExamSubmissionResponse,
)
def get_current_progress(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = AptisExamSubmissionService.get_submission_detail(db, submission_id)

    if not sub or sub.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Submission not found")

    return sub


@router.post(
    "/submit-step",
    response_model=schemas.AptisStepTransitionResponse,
)
def submit_skill_step(
    payload: schemas.AptisSkillCompletionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AptisExamSubmissionService.submit_skill_part(
        db=db,
        user_id=current_user.id,
        exam_submission_id=payload.exam_submission_id,
        current_step=payload.current_step,
        skill_submission_id=payload.skill_submission_id,
    )


# =========================
# 📜 STUDENT - HISTORY & RESULT
# =========================

@router.get(
    "/history",
    response_model=List[schemas.AptisExamSubmissionResponse],
)
def get_my_exam_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AptisExamSubmissionService.get_my_history(db, current_user.id)


@router.get(
    "/result/{submission_id}",
    response_model=schemas.AptisExamSubmissionResponse,
)
def get_exam_result(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = AptisExamSubmissionService.get_submission_detail(db, submission_id)

    if not sub:
        raise HTTPException(status_code=404, detail="Result not found")

    is_admin = str(getattr(current_user, "role", "")).upper() == "ADMIN"
    if not is_admin and sub.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return sub