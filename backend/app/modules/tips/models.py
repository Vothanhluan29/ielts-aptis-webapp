# Standard Library Imports
from datetime import datetime, timezone

# Third-Party Imports
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

# Local Application Core Imports
from app.core.database import Base


class Tip(Base):
    __tablename__ = "tips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="GENERAL")  # GRAMMAR_VOCAB, LISTENING, READING, WRITING, SPEAKING, GENERAL
    target_exam = Column(String(20), nullable=False, default="APTIS")
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    views_count = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    author = relationship("User", backref="tips")
