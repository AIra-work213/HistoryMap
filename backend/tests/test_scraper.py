"""Tests for scraper service."""

import pytest

from app.services import scraper_service


@pytest.mark.asyncio
async def test_fetch_diaries_for_region_year():
    """Test fetching diaries for a region and year."""
    entries = await scraper_service.fetch_diaries_for_region_year("Москва", 1941, limit=5)

    assert isinstance(entries, list)
    assert len(entries) <= 5

    if entries:
        entry = entries[0]
        assert "text" in entry
        assert "author" in entry
        assert "date" in entry
        assert "url" in entry


@pytest.mark.asyncio
async def test_fetch_diaries_returns_structure():
    """Test that diary entries have correct structure."""
    entries = await scraper_service.fetch_diaries_for_region_year("Ленинград", 1942)

    for entry in entries:
        assert isinstance(entry["text"], str)
        assert isinstance(entry["author"], str)
        assert isinstance(entry["date"], str)
        assert isinstance(entry["url"], str)

        # Text should not be empty
        assert len(entry["text"]) > 0


@pytest.mark.asyncio
async def test_get_population_stats():
    """Test getting population statistics."""
    stats = await scraper_service.get_population_stats("Москва", 1941)

    assert "population" in stats
    assert "change_percent" in stats
    assert "year" in stats

    assert stats["year"] == 1941
    assert stats["population"] > 0


@pytest.mark.asyncio
async def test_different_years_different_data():
    """Test that different years may return different data."""
    entries_1941 = await scraper_service.fetch_diaries_for_region_year("Москва", 1941)
    entries_1945 = await scraper_service.fetch_diaries_for_region_year("Москва", 1945)

    # Should both return data
    assert len(entries_1941) > 0
    assert len(entries_1945) > 0
