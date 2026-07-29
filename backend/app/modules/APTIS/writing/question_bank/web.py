from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user

from app.modules.APTIS.writing import schemas
from app.modules.APTIS.writing.question_bank import schemas as bank_schemas
from app.modules.APTIS.writing.question_bank.service import AptisWritingBankService

router = APIRouter(prefix="/aptis/writing", tags=["Aptis Writing Question Bank"])

@router.get("/admin/bank/groups", response_model=List[bank_schemas.BankGroupResponse])
def get_all_bank_groups(
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisWritingBankService.get_all_bank_groups(db)

@router.post("/admin/bank/groups", response_model=bank_schemas.BankGroupResponse, status_code=status.HTTP_201_CREATED)
def create_bank_group(
    group_in: bank_schemas.BankGroupCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisWritingBankService.create_bank_group(db, group_in)

@router.get("/admin/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def get_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisWritingBankService.get_bank_group(db, group_id)

@router.put("/admin/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def update_bank_group(
    group_id: int,
    group_in: bank_schemas.BankGroupUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisWritingBankService.update_bank_group(db, group_id, group_in)

@router.delete("/admin/bank/groups/{group_id}", status_code=status.HTTP_200_OK)
def delete_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisWritingBankService.delete_bank_group(db, group_id)

@router.post("/admin/bank/generate-test", response_model=schemas.WritingTestResponse, status_code=status.HTTP_201_CREATED)
def generate_random_test(
    config: bank_schemas.GenerateTestConfig,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisWritingBankService.generate_test(db, config)
