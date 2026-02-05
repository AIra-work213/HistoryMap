"""Services for ML and scraping."""

from app.services.ml_service import MLService, ml_service
from app.services.scraper import ScraperService, scraper_service

__all__ = ["MLService", "ScraperService", "ml_service", "scraper_service"]
