"""Map data endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import RegionData
from app.schemas import MapResponse, RegionDetailResponse
from app.services import ml_service, scraper_service
from app.utils import get_regions_from_geojson

router = APIRouter(tags=["map"])


@router.get("/api/map/{year}", response_model=MapResponse)
async def get_map_data(
    year: int = Path(ge=1920, le=1991, description="Year to display"),
    db: AsyncSession = Depends(get_db),
) -> MapResponse:

    regions = get_regions_from_geojson()
    region_responses = []

    for region in regions:
        # Try to get cached data
        stmt = select(RegionData).where(
            RegionData.year == year,
            RegionData.region_name == region["name"],
        )
        result = await db.execute(stmt)
        cached = result.scalar_one_or_none()

        if cached:
            # Check if cache is still valid
            cache_age = (datetime.utcnow() - cached.updated_at).total_seconds()
            if cache_age < settings.cache_ttl:
                region_responses.append(cached.to_dict())
                continue

        # Fetch fresh data
        diaries = await scraper_service.fetch_diaries_for_region_year(region["name"], year)

        if diaries:
            # Analyze emotions
            emotions_list = [
                ml_service.analyze_sentiment(entry["text"]) for entry in diaries
            ]
            aggregated = ml_service.aggregate_emotions(emotions_list)

            # Get stats
            stats = await scraper_service.get_population_stats(region["name"], year)

            # Update or create cache
            if cached:
                cached.fear = aggregated["fear"]
                cached.joy = aggregated["joy"]
                cached.neutral = aggregated["neutral"]
                cached.sadness = aggregated["sadness"]
                cached.diary_count = len(diaries)
                cached.diary_entries = diaries
                cached.stats = stats
                cached.updated_at = datetime.utcnow()
            else:
                cached = RegionData(
                    year=year,
                    region_name=region["name"],
                    geo_id=region.get("geo_id"),
                    fear=aggregated["fear"],
                    joy=aggregated["joy"],
                    neutral=aggregated["neutral"],
                    sadness=aggregated["sadness"],
                    diary_count=len(diaries),
                    diary_entries=diaries,
                    stats=stats,
                )
                db.add(cached)

            await db.commit()

            region_responses.append({
                "name": region["name"],
                "geo_id": region.get("geo_id"),
                "emotions": aggregated,
                "diary_count": len(diaries),
            })
        else:
            # No data available
            if cached:
                region_responses.append(cached.to_dict())
            else:
                region_responses.append({
                    "name": region["name"],
                    "geo_id": region.get("geo_id"),
                    "emotions": {"fear": 0.0, "joy": 0.0, "neutral": 1.0, "sadness": 0.0},
                    "diary_count": 0,
                })

    return MapResponse(year=year, regions=region_responses)


@router.get("/api/region/{year}/{region_name}", response_model=RegionDetailResponse)
async def get_region_detail(
    year: int = Path(ge=1920, le=1991, description="Year to display"),
    region_name: str = Path(description="Region name"),
    db: AsyncSession = Depends(get_db),
) -> RegionDetailResponse:

    # Get cached data
    stmt = select(RegionData).where(
        RegionData.year == year,
        RegionData.region_name == region_name,
    )
    result = await db.execute(stmt)
    cached = result.scalar_one_or_none()

    if cached:
        cache_age = (datetime.utcnow() - cached.updated_at).total_seconds()
        if cache_age < settings.cache_ttl:
            return RegionDetailResponse(
                name=cached.region_name,
                year=cached.year,
                emotions={
                    "fear": cached.fear,
                    "joy": cached.joy,
                    "neutral": cached.neutral,
                    "sadness": cached.sadness,
                },
                diary_entries=cached.diary_entries or [],
                stats=cached.stats or {
                    "population": 0,
                    "change_percent": 0.0,
                    "year": year,
                },
            )

    # Fetch fresh data
    diaries = await scraper_service.fetch_diaries_for_region_year(region_name, year)
    emotions_list = [ml_service.analyze_sentiment(entry["text"]) for entry in diaries]
    aggregated = ml_service.aggregate_emotions(emotions_list)
    stats = await scraper_service.get_population_stats(region_name, year)

    # Update cache
    if cached:
        cached.fear = aggregated["fear"]
        cached.joy = aggregated["joy"]
        cached.neutral = aggregated["neutral"]
        cached.sadness = aggregated["sadness"]
        cached.diary_count = len(diaries)
        cached.diary_entries = diaries
        cached.stats = stats
        cached.updated_at = datetime.utcnow()
    else:
        cached = RegionData(
            year=year,
            region_name=region_name,
            fear=aggregated["fear"],
            joy=aggregated["joy"],
            neutral=aggregated["neutral"],
            sadness=aggregated["sadness"],
            diary_count=len(diaries),
            diary_entries=diaries,
            stats=stats,
        )
        db.add(cached)

    await db.commit()

    return RegionDetailResponse(
        name=region_name,
        year=year,
        emotions=aggregated,
        diary_entries=diaries,
        stats=stats,
    )
