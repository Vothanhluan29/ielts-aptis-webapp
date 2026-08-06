from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user

from app.modules.APTIS.reading import schemas
from app.modules.APTIS.reading.question_bank import schemas as bank_schemas
from app.modules.APTIS.reading.question_bank.service import BankService

router = APIRouter(prefix="/aptis/reading", tags=["Aptis Reading Question Bank"])

@router.post("/bank/groups", response_model=bank_schemas.BankGroupResponse)
def create_bank_group(group_in: bank_schemas.BankGroupCreate, db: Session = Depends(get_db), admin=Depends(get_aptis_manager_user)):
    return BankService.create_bank_group(db, group_in)

@router.get("/bank/groups", response_model=List[bank_schemas.BankGroupResponse])
def get_bank_groups(part_number: Optional[int] = None, db: Session = Depends(get_db), admin=Depends(get_aptis_manager_user)):
    return BankService.get_bank_groups(db, part_number)

@router.get("/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def get_bank_group(group_id: int, db: Session = Depends(get_db), admin=Depends(get_aptis_manager_user)):
    return BankService.get_bank_group_by_id(db, group_id)

@router.put("/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def update_bank_group(group_id: int, group_in: bank_schemas.BankGroupUpdate, db: Session = Depends(get_db), admin=Depends(get_aptis_manager_user)):
    return BankService.update_bank_group(db, group_id, group_in)

@router.delete("/bank/groups/{group_id}")
def delete_bank_group(group_id: int, db: Session = Depends(get_db), admin=Depends(get_aptis_manager_user)):
    return BankService.delete_bank_group(db, group_id)

@router.post("/bank/generate", response_model=schemas.TestAdmin)
def generate_random_test(config: bank_schemas.GenerateTestConfig, db: Session = Depends(get_db), admin=Depends(get_aptis_manager_user)):
    return BankService.generate_test(db, config)
