from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user
from app.modules.APTIS.speaking import bank_schemas
from app.modules.APTIS.speaking.services.bank_service import AptisSpeakingBankService

router = APIRouter(prefix="/admin/aptis/speaking/bank", tags=["Aptis Speaking Bank"])

@router.get("/", response_model=List[bank_schemas.SpeakingBankGroupResponse])
def get_all_bank_groups(
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisSpeakingBankService.get_all_bank_groups(db)


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
