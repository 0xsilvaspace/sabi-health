# services/lga_coords.py
import httpx
import json
from pathlib import Path
from typing import Optional, Tuple

GEOJSON_URL = "https://temikeezy.github.io/nigeria-geojson-data/data/full.json"
_coords_cache = {}  # Simple in-memory cache

async def get_coordinates(lga_name: str) -> Optional[Tuple[float, float]]:
    """Get (lat, lon) for an LGA using dynamic data from GitHub."""
    # Normalize input
    lga_key = lga_name.strip().lower()
    
    # Check cache
    if lga_key in _coords_cache:
        return _coords_cache[lga_key]
    
    # Fetch GeoJSON
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(GEOJSON_URL)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        print(f"Error fetching GeoJSON: {e}")
        return await _fallback_coords(lga_name)
    
    # Parse the data structure
    # Expected format: list of states, each with "lgas" array of objects with "name", "wards"
    for state in data:
        for lga in state.get("lgas", []):
            lga_name_in_data = lga.get("name", "").lower()
            if lga_name_in_data == lga_key:
                # Get first ward's coordinates as LGA approximation
                wards = lga.get("wards", [])
                if wards and len(wards) > 0:
                    lat = wards[0].get("latitude")
                    lon = wards[0].get("longitude")
                    if lat is not None and lon is not None:
                        _coords_cache[lga_key] = (lat, lon)
                        return (lat, lon)
                # If no wards, try LGA-level coordinates if available
                lat = lga.get("latitude")
                lon = lga.get("longitude")
                if lat and lon:
                    _coords_cache[lga_key] = (lat, lon)
                    return (lat, lon)
    
    # Not found in dynamic data, try fallback
    return await _fallback_coords(lga_name)

async def _fallback_coords(lga_name: str) -> Optional[Tuple[float, float]]:
    """Fallback to local static file if API fails."""
    static_file = Path(__file__).parent / "lga_coordinates_fallback.json"
    if static_file.exists():
        with open(static_file) as f:
            static_coords = json.load(f)
        coords = static_coords.get(lga_name.strip().title())
        if coords:
            return tuple(coords)
    return None