"""Application configuration using pydantic-settings."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # API Settings
    api_title: str = "HistoryMap API"
    api_version: str = "0.1.0"
    debug: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///./historymap.db"

    # ML Settings
    ml_model_name: str = "seara/rubert-tiny-sentiment"
    ml_device: str = "cpu"
    ml_batch_size: int = 10

    # Scraper Settings
    scraper_base_url: str = "https://prozhito.org"
    scraper_timeout: int = 10
    scraper_delay: float = 0.5

    # Cache Settings (in seconds)
    cache_ttl: int = 86400  # 24 hours

    # Paths
    geojson_path: Path = Path(__file__).parent.parent.parent / "urss.geojson"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:4173"]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
