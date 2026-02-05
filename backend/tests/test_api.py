"""Tests for API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint."""
    response = await client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_get_map_data(client: AsyncClient, mock_geojson):
    """Test getting map data for a specific year."""
    response = await client.get("/api/map/1941")

    assert response.status_code == 200
    data = response.json()
    assert data["year"] == 1941
    assert "regions" in data
    assert len(data["regions"]) >= 2  # At least our 2 mock regions


@pytest.mark.asyncio
async def test_map_data_region_structure(client: AsyncClient, mock_geojson):
    """Test that map data has correct structure."""
    response = await client.get("/api/map/1941")

    assert response.status_code == 200
    data = response.json()

    if data["regions"]:
        region = data["regions"][0]
        assert "name" in region
        assert "emotions" in region
        assert "diary_count" in region

        emotions = region["emotions"]
        assert "fear" in emotions
        assert "joy" in emotions
        assert "neutral" in emotions
        assert "sadness" in emotions

        # Check emotion values are valid
        for emotion_value in emotions.values():
            assert 0 <= emotion_value <= 1


@pytest.mark.asyncio
async def test_get_region_detail(client: AsyncClient, mock_geojson):
    """Test getting detailed data for a specific region."""
    response = await client.get("/api/region/1941/Московская область")

    assert response.status_code == 200
    data = response.json()

    assert data["name"] == "Московская область"
    assert data["year"] == 1941
    assert "emotions" in data
    assert "diary_entries" in data
    assert "stats" in data


@pytest.mark.asyncio
async def test_region_caching(client: AsyncClient, mock_geojson):
    """Test that region data is cached and returns consistent results."""
    year = 1941

    # First request - should create cache
    response1 = await client.get(f"/api/map/{year}")
    assert response1.status_code == 200
    data1 = response1.json()

    # Second request - should return cached data (same results)
    response2 = await client.get(f"/api/map/{year}")
    assert response2.status_code == 200
    data2 = response2.json()

    # Both responses should have the same year
    assert data1["year"] == data2["year"] == year
    # Both should have the same number of regions
    assert len(data1["regions"]) == len(data2["regions"])


@pytest.mark.asyncio
async def test_invalid_year(client: AsyncClient):
    """Test that invalid years return appropriate errors."""
    # Year too early
    response = await client.get("/api/map/1900")
    assert response.status_code == 422  # Validation error

    # Year too late
    response = await client.get("/api/map/2000")
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test root endpoint."""
    response = await client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
