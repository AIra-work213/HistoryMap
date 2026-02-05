"""Pytest configuration and fixtures."""

import asyncio
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.database import Base, get_db
from app.config import settings


# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db():
    """Override database dependency for tests."""
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Create a test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Create test client with overridden database."""
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def mock_geojson(tmp_path: Path):
    """Create a mock GeoJSON file for testing."""
    geojson_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "ru-mos",
                "properties": {"name": "Московская область"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[37, 55], [38, 55], [38, 56], [37, 56], [37, 55]]],
                },
            },
            {
                "type": "Feature",
                "id": "ru-len",
                "properties": {"name": "Ленинградская область"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[30, 59], [31, 59], [31, 60], [30, 60], [30, 59]]],
                },
            },
        ],
    }

    import json
    from app.config import settings

    # Override geojson path for test
    original_path = settings.geojson_path
    test_geojson_path = tmp_path / "test_urss.geojson"

    with open(test_geojson_path, "w") as f:
        json.dump(geojson_data, f)

    settings.geojson_path = test_geojson_path

    yield test_geojson_path

    settings.geojson_path = original_path
