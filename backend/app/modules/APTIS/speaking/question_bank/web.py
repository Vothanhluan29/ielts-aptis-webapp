from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user
from app.modules.APTIS.speaking.question_bank import schemas as bank_schemas
from app.modules.APTIS.speaking.question_bank.service import AptisSpeakingBankService

router = APIRouter(prefix="/admin/aptis/speaking/bank", tags=["Aptis Speaking Bank"])

@router.get("/", response_model=bank_schemas.PaginatedSpeakingBankGroupResponse)
def get_bank_groups(
    part_number: Optional[int] = None,
    search: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisSpeakingBankService.get_bank_groups(db, part_number, search, difficulty_level, skip, limit)


@router.get("/stats", response_model=List[bank_schemas.BankGroupStatItem])
def get_bank_stats(db: Session = Depends(get_db), admin = Depends(get_aptis_manager_user)):
    return AptisSpeakingBankService.get_bank_stats(db)


@router.get("/{group_id}", response_model=bank_schemas.SpeakingBankGroupResponse)
def get_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisSpeakingBankService.get_bank_group(db, group_id)


@router.post("/", response_model=bank_schemas.SpeakingBankGroupResponse, status_code=status.HTTP_201_CREATED)
def create_bank_group(
    group_in: bank_schemas.SpeakingBankGroupCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisSpeakingBankService.create_bank_group(db, group_in)


@router.put("/{group_id}", response_model=bank_schemas.SpeakingBankGroupResponse)
def update_bank_group(
    group_id: int,
    group_in: bank_schemas.SpeakingBankGroupUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisSpeakingBankService.update_bank_group(db, group_id, group_in)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    AptisSpeakingBankService.delete_bank_group(db, group_id)


@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_random_test(
    config: bank_schemas.GenerateTestConfig,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisSpeakingBankService.generate_test(db, config)
