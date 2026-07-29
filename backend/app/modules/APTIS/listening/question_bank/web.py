from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user

from app.modules.APTIS.listening import schemas
from app.modules.APTIS.listening.question_bank import schemas as bank_schemas
from app.modules.APTIS.listening.question_bank.service import BankService

router = APIRouter(prefix="/aptis/listening", tags=["Aptis Listening Question Bank"])

@router.post("/admin/bank/groups", response_model=bank_schemas.BankGroupResponse, status_code=status.HTTP_201_CREATED)
def create_bank_group(
    group_data: bank_schemas.BankGroupCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return BankService.create_bank_group(db, group_data)

@router.get("/admin/bank/groups", response_model=List[bank_schemas.BankGroupResponse])
def get_bank_groups(
    part_number: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return BankService.get_bank_groups(db, part_number, skip, limit)

@router.get("/admin/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def get_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return BankService.get_bank_group_by_id(db, group_id)

@router.put("/admin/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def update_bank_group(
    group_id: int,
    group_data: bank_schemas.BankGroupUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return BankService.update_bank_group(db, group_id, group_data)

@router.delete("/admin/bank/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    BankService.delete_bank_group(db, group_id)
    return None

@router.post("/admin/bank/generate-test", response_model=schemas.ListeningTestResponse, status_code=status.HTTP_201_CREATED)
def generate_test_from_bank(
    config: bank_schemas.GenerateTestConfig,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return BankService.generate_test(db, config)
