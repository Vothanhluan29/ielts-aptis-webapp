from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import random
from fastapi import HTTPException
from app.modules.APTIS.grammar_vocab.bank_models import AptisGrammarVocabBankGroup, AptisGrammarVocabBankQuestion
from app.modules.APTIS.grammar_vocab import bank_schemas, schemas
from app.modules.APTIS.grammar_vocab.models import AptisGrammarVocabTest, AptisGrammarVocabGroup, AptisGrammarVocabQuestion, AptisQuestionPart

class AptisGrammarVocabBankService:
    @staticmethod
    def get_all_bank_groups(db: Session) -> List[AptisGrammarVocabBankGroup]:
        return db.query(AptisGrammarVocabBankGroup).order_by(AptisGrammarVocabBankGroup.created_at.desc()).all()

    @staticmethod
    def get_bank_group(db: Session, group_id: int) -> AptisGrammarVocabBankGroup:
        group = db.query(AptisGrammarVocabBankGroup).filter(AptisGrammarVocabBankGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Bank group not found")
        return group

    @staticmethod
    def create_bank_group(db: Session, group_in: bank_schemas.BankGroupCreate) -> AptisGrammarVocabBankGroup:
        db_group = AptisGrammarVocabBankGroup(
            part_type=group_in.part_type,
            instruction=group_in.instruction,
            difficulty_level=group_in.difficulty_level,
            tags=group_in.tags
        )
        db.add(db_group)
        db.flush()

        for q_in in group_in.questions:
            db_q = AptisGrammarVocabBankQuestion(
                bank_group_id=db_group.id,
                question_number=q_in.question_number,
                question_text=q_in.question_text,
                options=q_in.options,
                correct_answer=q_in.correct_answer,
                explanation=q_in.explanation
            )
            db.add(db_q)
        
        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def update_bank_group(db: Session, group_id: int, group_in: bank_schemas.BankGroupUpdate) -> AptisGrammarVocabBankGroup:
        db_group = AptisGrammarVocabBankService.get_bank_group(db, group_id)
        
        db_group.part_type = group_in.part_type
        db_group.instruction = group_in.instruction
        db_group.difficulty_level = group_in.difficulty_level
        db_group.tags = group_in.tags

        # Delete old questions
        db.query(AptisGrammarVocabBankQuestion).filter(AptisGrammarVocabBankQuestion.bank_group_id == group_id).delete()
        
        # Add new questions
        for q_in in group_in.questions:
            db_q = AptisGrammarVocabBankQuestion(
                bank_group_id=db_group.id,
                question_number=q_in.question_number,
                question_text=q_in.question_text,
                options=q_in.options,
                correct_answer=q_in.correct_answer,
                explanation=q_in.explanation
            )
            db.add(db_q)

        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def delete_bank_group(db: Session, group_id: int):
        db_group = AptisGrammarVocabBankService.get_bank_group(db, group_id)
        db.delete(db_group)
        db.commit()

    @staticmethod
    def generate_test(db: Session, config: bank_schemas.GenerateTestConfig):
        # We need 25 Grammar questions and 25 Vocab questions (Vocab usually consists of 5 groups of 5 questions each)
        
        # Get Grammar questions (from Grammar bank groups)
        grammar_groups = db.query(AptisGrammarVocabBankGroup).filter(
            AptisGrammarVocabBankGroup.part_type == AptisQuestionPart.GRAMMAR
        )
        grammar_diff = config.part_difficulties.get('GRAMMAR') if config.part_difficulties else None
        grammar_diff_to_use = grammar_diff or config.difficulty_level
        if grammar_diff_to_use:
            grammar_groups = grammar_groups.filter(AptisGrammarVocabBankGroup.difficulty_level == grammar_diff_to_use)
            
        grammar_groups = grammar_groups.all()
        
        all_grammar_questions = []
        for g in grammar_groups:
            all_grammar_questions.extend(g.questions)
            
        if len(all_grammar_questions) < 25:
            raise HTTPException(status_code=400, detail=f"Not enough grammar questions in the bank. Need 25, found {len(all_grammar_questions)}.")
            
        selected_grammar_questions = random.sample(all_grammar_questions, 25)

        # Get Vocab groups (We need exactly 5 groups of 5 questions each)
        vocab_types = [
            AptisQuestionPart.VOCAB_WORD_DEFINITION,
            AptisQuestionPart.VOCAB_WORD_PAIRS,
            AptisQuestionPart.VOCAB_WORD_USAGE,
            AptisQuestionPart.VOCAB_WORD_COMBINATIONS
        ]
        
        vocab_groups = db.query(AptisGrammarVocabBankGroup).filter(
            AptisGrammarVocabBankGroup.part_type.in_(vocab_types)
        )
        vocab_diff = config.part_difficulties.get('VOCAB') if config.part_difficulties else None
        vocab_diff_to_use = vocab_diff or config.difficulty_level
        if vocab_diff_to_use:
            vocab_groups = vocab_groups.filter(AptisGrammarVocabBankGroup.difficulty_level == vocab_diff_to_use)
            
        vocab_groups = vocab_groups.all()
        
        # We need to pick 5 groups that have exactly 5 questions each ideally, or just pick 5 groups.
        valid_vocab_groups = [g for g in vocab_groups if len(g.questions) >= 5]
        
        if len(valid_vocab_groups) < 5:
            raise HTTPException(status_code=400, detail=f"Not enough valid vocab groups (with at least 5 questions) in the bank. Need 5 groups, found {len(valid_vocab_groups)}.")
            
        selected_vocab_groups = random.sample(valid_vocab_groups, 5)

        # Create the Test
        db_test = AptisGrammarVocabTest(
            title=config.title,
            description=config.description,
            time_limit=config.time_limit,
            is_published=config.is_published,
            is_full_test_only=config.is_full_test_only
        )
        db.add(db_test)
        db.flush()

        # Create Grammar Group in Test
        grammar_test_group = AptisGrammarVocabGroup(
            test_id=db_test.id,
            part_type=AptisQuestionPart.GRAMMAR,
            group_order=1
        )
        db.add(grammar_test_group)
        db.flush()
        
        # Add Grammar Questions
        for i, q in enumerate(selected_grammar_questions):
            db_q = AptisGrammarVocabQuestion(
                group_id=grammar_test_group.id,
                question_number=i + 1,
                question_text=q.question_text,
                options=q.options,
                correct_answer=q.correct_answer,
                explanation=q.explanation
            )
            db.add(db_q)

        # Add Vocab Groups
        for i, bg in enumerate(selected_vocab_groups):
            vocab_test_group = AptisGrammarVocabGroup(
                test_id=db_test.id,
                part_type=bg.part_type,
                group_order=i + 2,
                instruction=bg.instruction
            )
            db.add(vocab_test_group)
            db.flush()
            
            # Select 5 questions from this vocab group
            selected_qs = random.sample(bg.questions, 5)
            for j, q in enumerate(selected_qs):
                db_q = AptisGrammarVocabQuestion(
                    group_id=vocab_test_group.id,
                    question_number=j + 1,
                    question_text=q.question_text,
                    options=q.options,
                    correct_answer=q.correct_answer,
                    explanation=q.explanation
                )
                db.add(db_q)
                
        db.commit()
        db.refresh(db_test)
        return db_test
