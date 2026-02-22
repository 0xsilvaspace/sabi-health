# services/health_centers.py
from typing import Dict, Optional

# Mock data for health centers in major Nigerian LGAs
# Includes coordinates for map display
HEALTH_CENTERS = {
    "kano": {
        "name": "Kano General Hospital",
        "address": "Bompai Road, Kano",
        "lat": 12.0022,
        "lon": 8.5287,
        "recommendation": "Please visit Kano General Hospital immediately. Cover your food and water to prevent Lassa fever."
    },
    "lagos": {
        "name": "Lagos Island Maternity Hospital",
        "address": "Campbell Street, Lagos",
        "lat": 6.4520,
        "lon": 3.4001,
        "recommendation": "Please visit Lagos Island Maternity Hospital. Boil your water before drinking to prevent Cholera."
    },
    "abuja": {
        "name": "Asokoro District Hospital",
        "address": "Binji Garden, Abuja",
        "lat": 9.0435,
        "lon": 7.5145,
        "recommendation": "Please visit Asokoro District Hospital. Sleep under a treated mosquito net to prevent Malaria."
    },
    "benue": {
        "name": "Federal Medical Centre, Makurdi",
        "address": "Makurdi, Benue",
        "lat": 7.7322,
        "lon": 8.5391,
        "recommendation": "Please visit Federal Medical Centre, Makurdi. Dispose of waste properly to keep rats away."
    },
    "sokoto": {
        "name": "Usmanu Danfodiyo University Teaching Hospital",
        "address": "Sokoto",
        "lat": 13.0622,
        "lon": 5.2339,
        "recommendation": "Please visit UDUTH Sokoto. Use insect repellent and wear long sleeves."
    },
    "kaduna": {
        "name": "Barau Dikko Teaching Hospital",
        "address": "Lafia Road, Kaduna",
        "lat": 10.5105,
        "lon": 7.4165,
        "recommendation": "Please visit Barau Dikko Teaching Hospital. Maintain strict personal hygiene."
    },
    "maiduguri": {
        "name": "State Specialist Hospital, Maiduguri",
        "address": "Maiduguri, Borno",
        "lat": 11.8333,
        "lon": 13.1500,
        "recommendation": "Please visit State Specialist Hospital. Ensure your drinking water is chlorinated."
    },
    "enugu": {
        "name": "Enugu State University Teaching Hospital",
        "address": "Parklane, Enugu",
        "lat": 6.4413,
        "lon": 7.5029,
        "recommendation": "Clear stagnant water around your home to prevent mosquito breeding."
    }
}

import math

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Haversine distance between two points in kilometers."""
    R = 6371  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_closest_hospital(lat: float, lon: float) -> Optional[Dict]:
    """Find the closest hospital to the given coordinates."""
    closest_hospital = None
    min_distance = float('inf')
    
    for key, hospital in HEALTH_CENTERS.items():
        dist = calculate_distance(lat, lon, hospital['lat'], hospital['lon'])
        if dist < min_distance:
            min_distance = dist
            closest_hospital = hospital
            
    return closest_hospital

def get_nearest_health_center(lga: str) -> Optional[Dict]:
    """Return health center info for the given LGA (Legacy LGA-based lookup)."""
    return HEALTH_CENTERS.get(lga.strip().lower())

def get_default_recommendation() -> str:
    return "Please visit the nearest primary health center immediately for a check-up. Stay safe."
