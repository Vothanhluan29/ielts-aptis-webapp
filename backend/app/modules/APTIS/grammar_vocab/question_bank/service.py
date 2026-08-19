from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import random
from fastapi import HTTPException
from app.modules.APTIS.grammar_vocab.question_bank.models import AptisGrammarVocabBankGroup, AptisGrammarVocabBankQuestion
from app.modules.APTIS.grammar_vocab.question_bank import schemas as bank_schemas
from app.modules.APTIS.grammar_vocab import schemas
from app.modules.APTIS.grammar_vocab.models import AptisGrammarVocabTest, AptisGrammarVocabGroup, AptisGrammarVocabQuestion, AptisQuestionPart

class AptisGrammarVocabBankService:
    @staticmethod
    def get_bank_groups(
        db: Session, 
        part_number: int = None, 
        search: str = None, 
        difficulty_level: str = None, 
        skip: int = 0, 
        limit: int = 10
    ):
        query = db.query(AptisGrammarVocabBankGroup)
        
        if part_number is not None and hasattr(AptisGrammarVocabBankGroup, 'part_number'):
            query = query.filter(AptisGrammarVocabBankGroup.part_number == part_number)
            
        if search and hasattr(AptisGrammarVocabBankGroup, 'instruction'):
            query = query.filter(AptisGrammarVocabBankGroup.instruction.ilike(f"%{search}%"))
            
        if difficulty_level and hasattr(AptisGrammarVocabBankGroup, 'difficulty_level'):
            query = query.filter(AptisGrammarVocabBankGroup.difficulty_level == difficulty_level)
            
        total = query.count()
        items = query.order_by(AptisGrammarVocabBankGroup.id.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

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
    def get_bank_stats(db: Session):
        # Grammar: count groups with exactly 25 questions
        grammar_subq = db.query(
            AptisGrammarVocabBankGroup.id,
            AptisGrammarVocabBankGroup.difficulty_level
        ).join(
            AptisGrammarVocabBankQuestion, AptisGrammarVocabBankQuestion.bank_group_id == AptisGrammarVocabBankGroup.id
        ).filter(
            AptisGrammarVocabBankGroup.part_type == AptisQuestionPart.GRAMMAR
        ).group_by(
            AptisGrammarVocabBankGroup.id,
            AptisGrammarVocabBankGroup.difficulty_level
        ).having(
            func.count(AptisGrammarVocabBankQuestion.id) >= 25
        ).subquery()
        
        grammar_stats = db.query(
            grammar_subq.c.difficulty_level,
            func.count(grammar_subq.c.id).label('count')
        ).group_by(grammar_subq.c.difficulty_level).all()

        # Vocab: count groups with exactly 5 questions per type
        vocab_types = [
            AptisQuestionPart.VOCAB_WORD_DEFINITION,
            AptisQuestionPart.VOCAB_WORD_PAIRS,
            AptisQuestionPart.VOCAB_WORD_USAGE,
            AptisQuestionPart.VOCAB_WORD_MATCH,
            AptisQuestionPart.VOCAB_COLLOCATIONS
        ]
        
        vocab_subq = db.query(
            AptisGrammarVocabBankGroup.id,
            AptisGrammarVocabBankGroup.part_type,
            AptisGrammarVocabBankGroup.difficulty_level
        ).join(
            AptisGrammarVocabBankQuestion, AptisGrammarVocabBankQuestion.bank_group_id == AptisGrammarVocabBankGroup.id
        ).filter(
            AptisGrammarVocabBankGroup.part_type.in_(vocab_types)
        ).group_by(
            AptisGrammarVocabBankGroup.id,
            AptisGrammarVocabBankGroup.part_type,
            AptisGrammarVocabBankGroup.difficulty_level
        ).having(
            func.count(AptisGrammarVocabBankQuestion.id) >= 5
        ).subquery()
        
        vocab_type_counts = db.query(
            vocab_subq.c.difficulty_level,
            vocab_subq.c.part_type,
            func.count(vocab_subq.c.id).label('count')
        ).group_by(
            vocab_subq.c.difficulty_level,
            vocab_subq.c.part_type
        ).all()
        
        results = []
        for row in grammar_stats:
            results.append({"part": "GRAMMAR", "difficulty_level": row.difficulty_level, "count": row.count})
            
        for row in vocab_type_counts:
            results.append({"part": row.part_type.value, "difficulty_level": row.difficulty_level, "count": row.count})
            
        return results

    @staticmethod
    def generate_test(db: Session, config: bank_schemas.GenerateTestConfig):
        # We need 25 Grammar questions and 5 groups of Vocab questions (5 questions each)
        
        # Get Grammar questions (from exactly 1 Grammar bank group)
        grammar_query = db.query(AptisGrammarVocabBankGroup).filter(
            AptisGrammarVocabBankGroup.part_type == AptisQuestionPart.GRAMMAR
        )
        grammar_diff = config.part_difficulties.get('GRAMMAR') if config.part_difficulties else None
        grammar_diff_to_use = grammar_diff or config.difficulty_level
        if grammar_diff_to_use:
            grammar_query = grammar_query.filter(AptisGrammarVocabBankGroup.difficulty_level == grammar_diff_to_use)
            
        grammar_query = grammar_query.join(AptisGrammarVocabBankQuestion).group_by(AptisGrammarVocabBankGroup.id).having(func.count(AptisGrammarVocabBankQuestion.id) >= 25)
        
        random_grammar_group = grammar_query.order_by(func.random()).first()
        if not random_grammar_group:
            raise HTTPException(status_code=400, detail="Not enough valid grammar groups (with at least 25 questions) in the bank.")
        
        selected_grammar_questions = sorted(random_grammar_group.questions, key=lambda q: q.question_number)[:25]

        # Get Vocab groups (5 groups, 1 for each type, each with exactly 5 questions)
        vocab_types = [
            AptisQuestionPart.VOCAB_WORD_DEFINITION,
            AptisQuestionPart.VOCAB_WORD_PAIRS,
            AptisQuestionPart.VOCAB_WORD_USAGE,
            AptisQuestionPart.VOCAB_WORD_MATCH,
            AptisQuestionPart.VOCAB_COLLOCATIONS
        ]
        
        selected_vocab_groups = []
        for v_type in vocab_types:
            specific_vocab_diff = config.part_difficulties.get(v_type.value) if config.part_difficulties else None
            vocab_diff_to_use = specific_vocab_diff or config.difficulty_level
            
            vocab_query = db.query(AptisGrammarVocabBankGroup).filter(
                AptisGrammarVocabBankGroup.part_type == v_type
            )
            if vocab_diff_to_use:
                vocab_query = vocab_query.filter(AptisGrammarVocabBankGroup.difficulty_level == vocab_diff_to_use)
                
            vocab_query = vocab_query.join(AptisGrammarVocabBankQuestion).group_by(AptisGrammarVocabBankGroup.id).having(func.count(AptisGrammarVocabBankQuestion.id) >= 5)
            
            random_vocab_group = vocab_query.order_by(func.random()).first()
            if not random_vocab_group:
                raise HTTPException(status_code=400, detail=f"Not enough valid vocab groups for type {v_type.value} (with at least 5 questions) in the bank.")
            
            selected_vocab_groups.append(random_vocab_group)

        # Create the Test
        db_test = AptisGrammarVocabTest(
            title=config.title,
            description=config.description,
            time_limit=config.time_limit,
            is_published=config.is_published,
            difficulty_level=config.difficulty_level,
            is_full_test_only=config.is_full_test_only
        )
        db.add(db_test)
        db.flush()

        # Create Grammar Group in Test
        grammar_test_group = AptisGrammarVocabGroup(
            test_id=db_test.id,
            part_type=AptisQuestionPart.GRAMMAR,
            instruction=random_grammar_group.instruction or "Grammar"
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

        # Create 5 Vocab Groups in Test
        current_question_number = 1
        for idx, random_vocab_group in enumerate(selected_vocab_groups):
            vocab_test_group = AptisGrammarVocabGroup(
                test_id=db_test.id,
                part_type=random_vocab_group.part_type,
                instruction=random_vocab_group.instruction or "Vocabulary"
            )
            db.add(vocab_test_group)
            db.flush()
            
            selected_vocab_questions = sorted(random_vocab_group.questions, key=lambda q: q.question_number)[:5]
            
            # Add Vocab Questions for this group
            for q in selected_vocab_questions:
                db_q = AptisGrammarVocabQuestion(
                    group_id=vocab_test_group.id,
                    question_number=current_question_number,
                    question_text=q.question_text,
                    options=q.options,
                    correct_answer=q.correct_answer,
                    explanation=q.explanation
                )
                db.add(db_q)
                current_question_number += 1
                
        db.commit()
        db.refresh(db_test)
        return db_test
