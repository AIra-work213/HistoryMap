"""Database models for caching scraped data and ML results."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Float, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RegionData(Base):
    """Cached region data with emotions and diary entries."""

    __tablename__ = "region_data"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    region_name: Mapped[str] = mapped_column(String(200), index=True)
    geo_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Emotions (normalized to 0-1)
    fear: Mapped[float] = mapped_column(Float, default=0.0)
    joy: Mapped[float] = mapped_column(Float, default=0.0)
    neutral: Mapped[float] = mapped_column(Float, default=0.0)
    sadness: Mapped[float] = mapped_column(Float, default=0.0)

    # Diary entries count
    diary_count: Mapped[int] = mapped_column(Integer, default=0)

    # Raw data
    diary_entries: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    stats: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Cache metadata
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        """Convert model to dictionary for API responses."""
        return {
            "name": self.region_name,
            "geo_id": self.geo_id,
            "emotions": {
                "fear": self.fear,
                "joy": self.joy,
                "neutral": self.neutral,
                "sadness": self.sadness,
            },
            "diary_count": self.diary_count,
        }
