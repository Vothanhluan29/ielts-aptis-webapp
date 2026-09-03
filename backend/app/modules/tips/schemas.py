# Standard Library Imports
from datetime import datetime
from typing import Optional, List

# Third-Party Imports
from pydantic import BaseModel, field_validator
from app.core.url_helpers import rewrite_static_url


class TipBase(BaseModel):
    title: str
    summary: Optional[str] = None
    content: str
    category: str = "GENERAL"
    target_exam: str = "APTIS"
    thumbnail_url: Optional[str] = None
    is_published: bool = True


class TipCreate(TipBase):
    pass


class TipUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    target_exam: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class AuthorSimple(BaseModel):
    id: int
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator('avatar_url', mode='after')
    @classmethod
    def fix_avatar_url(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True


class TipResponse(TipBase):
    id: int
    author_id: Optional[int] = None
    author: Optional[AuthorSimple] = None
    views_count: int = 0
    created_at: datetime
    updated_at: datetime

    @field_validator('thumbnail_url', mode='after')
    @classmethod
    def fix_thumbnail_url(cls, v):
        return rewrite_static_url(v)

    class Config:
        from_attributes = True


class TipListPaginatedResponse(BaseModel):
    items: List[TipResponse]
    total: int
    page: int
    size: int
    total_pages: int
