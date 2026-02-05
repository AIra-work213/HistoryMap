"""GeoJSON utilities for loading and parsing USSR map data."""

import json
from pathlib import Path
from typing import Any

from app.config import settings


def load_geojson() -> dict[str, Any]:
    """Load the USSR GeoJSON file."""
    geojson_path = settings.geojson_path

    if not geojson_path.exists():
        # Return empty GeoJSON structure if file doesn't exist
        return {
            "type": "FeatureCollection",
            "features": [],
        }

    with open(geojson_path, encoding="utf-8") as f:
        return json.load(f)


def get_regions_from_geojson() -> list[dict[str, Any]]:
    """Extract list of regions from GeoJSON."""
    geojson = load_geojson()
    regions = []

    for feature in geojson.get("features", []):
        props = feature.get("properties", {})
        region_id = feature.get("id", "")

        regions.append({
            "name": props.get("name", "Unknown Region"),
            "geo_id": region_id,
            "geometry": feature.get("geometry"),
        })

    return regions


def get_region_by_name(name: str) -> dict[str, Any] | None:
    """Get a specific region by name from GeoJSON."""
    regions = get_regions_from_geojson()
    for region in regions:
        if region["name"].lower() == name.lower():
            return region
    return None
