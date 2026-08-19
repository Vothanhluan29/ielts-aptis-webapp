from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_aptis_manager_user 

from app.modules.APTIS.grammar_vocab import schemas
from app.modules.APTIS.grammar_vocab.models import AptisQuestionPart
from app.modules.APTIS.grammar_vocab.question_bank import schemas as bank_schemas
from app.modules.APTIS.grammar_vocab.question_bank.service import AptisGrammarVocabBankService

router = APIRouter(prefix="/aptis/grammar-vocab", tags=["Aptis Grammar & Vocabulary Question Bank"])

@router.get("/bank/groups", response_model=bank_schemas.PaginatedBankGroupResponse)
def get_bank_groups(
    part_type: Optional[AptisQuestionPart] = None,
    search: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisGrammarVocabBankService.get_bank_groups(db, part_type, search, difficulty_level, skip, limit)

@router.get("/bank/stats", response_model=List[bank_schemas.BankGroupStatItem])
def get_bank_stats(db: Session = Depends(get_db), admin = Depends(get_aptis_manager_user)):
    return AptisGrammarVocabBankService.get_bank_stats(db)

@router.post("/bank/groups", response_model=bank_schemas.BankGroupResponse, status_code=status.HTTP_201_CREATED)
def create_bank_group(
    group_in: bank_schemas.BankGroupCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisGrammarVocabBankService.create_bank_group(db, group_in)

@router.get("/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def get_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisGrammarVocabBankService.get_bank_group(db, group_id)

@router.put("/bank/groups/{group_id}", response_model=bank_schemas.BankGroupResponse)
def update_bank_group(
    group_id: int,
    group_in: bank_schemas.BankGroupUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisGrammarVocabBankService.update_bank_group(db, group_id, group_in)

@router.delete("/bank/groups/{group_id}", status_code=status.HTTP_200_OK)
def delete_bank_group(
    group_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisGrammarVocabBankService.delete_bank_group(db, group_id)

@router.post("/bank/generate-test", response_model=schemas.TestAdminDetailResponse, status_code=status.HTTP_201_CREATED)
def generate_random_test(
    config: bank_schemas.GenerateTestConfig,
    db: Session = Depends(get_db),
    admin = Depends(get_aptis_manager_user)
):
    return AptisGrammarVocabBankService.generate_test(db, config)
