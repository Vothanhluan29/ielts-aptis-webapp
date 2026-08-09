# Standard Library Imports
import math

# Third-Party Imports
from fastapi import HTTPException
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

# Local Application Modules Imports
from app.modules.tips import schemas
from app.modules.tips.models import Tip


class TipService:
    @staticmethod
    def get_all_tips(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        category: str = None,
        search: str = None,
        is_admin: bool = False
    ):
        query = db.query(Tip)

        if not is_admin:
            query = query.filter(Tip.is_published == True)

        if category and category.upper() != "ALL":
            query = query.filter(Tip.category == category.upper())

        if search and search.strip():
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Tip.title.ilike(search_pattern),
                    Tip.summary.ilike(search_pattern),
                    Tip.content.ilike(search_pattern)
                )
            )

        total = query.count()
        items = query.order_by(desc(Tip.created_at)).offset(skip).limit(limit).all()

        page = (skip // limit) + 1 if limit > 0 else 1
        total_pages = math.ceil(total / limit) if limit > 0 else 1

        return {
            "items": items,
            "total": total,
            "page": page,
            "size": limit,
            "total_pages": total_pages
        }

    @staticmethod
    def get_tip_by_id(db: Session, tip_id: int, increment_view: bool = True):
        tip = db.query(Tip).filter(Tip.id == tip_id).first()
        if not tip:
            raise HTTPException(status_code=404, detail="Tip not found")
        if increment_view:
            tip.views_count += 1
            db.commit()
            db.refresh(tip)
        return tip

    @staticmethod
    def create_tip(db: Session, tip_in: schemas.TipCreate, author_id: int):
        tip = Tip(**tip_in.model_dump(), author_id=author_id)
        db.add(tip)
        db.commit()
        db.refresh(tip)
        return tip

    @staticmethod
    def update_tip(db: Session, tip_id: int, tip_update: schemas.TipUpdate):
        tip = db.query(Tip).filter(Tip.id == tip_id).first()
        if not tip:
            raise HTTPException(status_code=404, detail="Tip not found")

        update_data = tip_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tip, field, value)

        db.commit()
        db.refresh(tip)
        return tip

    @staticmethod
    def delete_tip(db: Session, tip_id: int):
        tip = db.query(Tip).filter(Tip.id == tip_id).first()
        if not tip:
            raise HTTPException(status_code=404, detail="Tip not found")
        db.delete(tip)
        db.commit()
        return {"message": "Tip deleted successfully"}
