"""API routers."""

from app.routers.map import router as map_router
from app.routers.health import router as health_router

__all__ = ["map_router", "health_router"]
