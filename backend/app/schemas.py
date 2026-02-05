"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, Field


class EmotionResponse(BaseModel):
    """Emotion scores for a region."""

    fear: float = Field(ge=0, le=1, description="Fear emotion score")
    joy: float = Field(ge=0, le=1, description="Joy emotion score")
    neutral: float = Field(ge=0, le=1, description="Neutral emotion score")
    sadness: float = Field(ge=0, le=1, description="Sadness emotion score")


class RegionDataResponse(BaseModel):
    """Response data for a single region on the map."""

    name: str = Field(description="Region name")
    geo_id: str | None = Field(None, description="GeoJSON feature ID")
    emotions: EmotionResponse = Field(description="Emotion scores")
    diary_count: int = Field(ge=0, description="Number of diary entries")


class MapResponse(BaseModel):
    """Response for map data endpoint."""

    year: int = Field(description="Selected year")
    regions: list[RegionDataResponse] = Field(description="List of regions with emotion data")


class DiaryEntry(BaseModel):
    """Single diary entry."""

    text: str = Field(description="Diary text content")
    author: str = Field(description="Author name")
    date: str = Field(description="Entry date")
    url: str = Field(description="Link to original entry")


class StatsResponse(BaseModel):
    """Population and other statistics."""

    population: int = Field(ge=0, description="Population count")
    change_percent: float = Field(description="Population change percentage")
    year: int = Field(description="Statistics year")


class RegionDetailResponse(BaseModel):
    """Detailed response for a specific region."""

    name: str = Field(description="Region name")
    year: int = Field(description="Selected year")
    emotions: EmotionResponse = Field(description="Emotion scores")
    diary_entries: list[DiaryEntry] = Field(description="Diary entries")
    stats: StatsResponse = Field(description="Population statistics")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(description="Service status")
    version: str = Field(description="API version")
