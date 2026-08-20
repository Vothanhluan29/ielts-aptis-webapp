# Standard Library Imports
import logging
from typing import Optional

# Third-Party Imports
from fastapi import APIRouter, Depends, Query, status, File, UploadFile
from sqlalchemy.orm import Session

# Local Application Core Imports
from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user
from app.core.storage import upload_file
from app.modules.users.models import User

# Local Application Modules Imports
from app.modules.tips import schemas
from app.modules.tips.services import TipService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/aptis/tips", tags=["Aptis Exam Tips"])


# =========================
# PUBLIC / STUDENT ENDPOINTS
# =========================

@router.get("", response_model=schemas.TipListPaginatedResponse)
def get_tips_for_student(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các bài viết mẹo làm bài thi APTIS có hỗ trợ phân trang và tìm kiếm."""
    return TipService.get_all_tips(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        search=search,
        is_admin=False
    )


@router.get("/{tip_id}", response_model=schemas.TipResponse)
def get_tip_detail(
    tip_id: int,
    db: Session = Depends(get_db)
):
    """Lấy chi tiết bài viết mẹo làm bài và tăng số lượt xem."""
    return TipService.get_tip_by_id(db=db, tip_id=tip_id, increment_view=True)


# =========================
# ADMIN / TEACHER ENDPOINTS
# =========================

@router.get("/admin/all", response_model=schemas.TipListPaginatedResponse)
def admin_get_all_tips(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_aptis_manager_user)
):
    """Admin/Giáo viên lấy toàn bộ bài đăng Tips (bao gồm bài ẩn) có phân trang."""
    return TipService.get_all_tips(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        search=search,
        is_admin=True
    )


@router.post("/admin", response_model=schemas.TipResponse, status_code=status.HTTP_201_CREATED)
def admin_create_tip(
    tip_in: schemas.TipCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_aptis_manager_user)
):
    """Admin/Giáo viên đăng bài viết mẹo mới."""
    logger.info(f"AUDIT LOG: Admin User ID {admin.id} created new Tip title '{tip_in.title}'")
    return TipService.create_tip(db=db, tip_in=tip_in, author_id=admin.id)


@router.put("/admin/{tip_id}", response_model=schemas.TipResponse)
def admin_update_tip(
    tip_id: int,
    tip_update: schemas.TipUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_aptis_manager_user)
):
    """Admin/Giáo viên cập nhật nội dung bài viết mẹo."""
    logger.info(f"AUDIT LOG: Admin User ID {admin.id} updated Tip ID {tip_id}")
    return TipService.update_tip(db=db, tip_id=tip_id, tip_update=tip_update)


@router.delete("/admin/{tip_id}")
def admin_delete_tip(
    tip_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_aptis_manager_user)
):
    """Admin/Giáo viên xóa bài viết mẹo."""
    logger.info(f"AUDIT LOG: Admin User ID {admin.id} deleted Tip ID {tip_id}")
    return TipService.delete_tip(db=db, tip_id=tip_id)


@router.post("/admin/upload-image")
async def admin_upload_tip_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_aptis_manager_user)
):
    """Admin/Teacher upload image for Tip article cover."""
    logger.info(f"AUDIT LOG: Admin User ID {admin.id} uploaded tip cover image '{file.filename}'")
    url = await upload_file(file, folder_name="tips")
    return {"url": url}

