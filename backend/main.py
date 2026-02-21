from fastapi import FastAPI, HTTPException, BackgroundTasks
from datetime import datetime
from services import lga_coords, weather, risk
from models import Log
from fastapi.middleware.cors import CORSMiddleware
from models import UserCreate, User
from data import users_db, logs_db
from risk import check_risk_for_lga
import uuid

app = FastAPI(title="Sabi Health API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=User)
def register_user(user: UserCreate):
    """Register a new user."""
    # Check if phone already exists? Optional for MVP
    new_user = User(**user.dict())
    users_db[new_user.id] = new_user
    return new_user

@app.get("/risk-check/{user_id}")
def check_user_risk(user_id: str):
    """Get current risk level for a user based on their LGA."""
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    risk = check_risk_for_lga(user.lga)
    return {"user_id": user_id, "risk": risk}

@app.get("/users")
def list_users():
    """Return all registered users (for dashboard)."""
    return list(users_db.values())

@app.get("/logs")
def get_logs():
    """Return all call logs."""
    return logs_db


async def generate_health_message(lga: str, risk_type: str):
    """
    Temporary stub for message generation.
    Replace with call to Dev A's /generate-message endpoint.
    """
    # In real scenario, we'd do: async with httpx.AsyncClient() as client:
    #   resp = await client.post("http://localhost:8000/generate-message", json={"lga": lga, "risk": risk_type})
    #   data = resp.json(); return data["script"], data["audio_url"]
    script = f"Good evening! I see say {lga} dey inside {risk_type} risk area. Make sure you cover your food well well, use your mosquito net, and if anybody get fever, go hospital quick quick."
    audio_url = "https://example.com/audio.mp3"  # Placeholder
    return script, audio_url

@app.post("/call-user/{user_id}")
async def call_user(user_id: str, background_tasks: BackgroundTasks):
    """
    Trigger a health call for a specific user.
    - Fetches real rainfall data via Open-Meteo.
    - Determines risk using hotspots and rainfall.
    - If HIGH, generates message and returns audio URL for frontend simulation.
    """
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get coordinates for user's LGA
    coords = lga_coords.get_coordinates(user.lga)
    if not coords:
        # Log missing coordinates but return informative message
        return {
            "status": "error",
            "message": f"Coordinates not found for LGA: {user.lga}. Please add to lga_coordinates.json."
        }

    lat, lon = coords
    rainfall = await weather.get_rainfall(lat, lon)
    risk_level = risk.check_risk_for_lga(user.lga, rainfall)

    if risk_level == "LOW":
        return {
            "status": "ok",
            "risk": risk_level,
            "message": f"No significant risk detected for {user.lga} (rainfall: {rainfall:.1f}mm)."
        }

    # Risk is HIGH -> generate message via Dev A's endpoint (stub for now)
    script, audio_url = await generate_health_message(user.lga, risk_level)

    # Create log entry
    log_entry = Log(
        id=str(uuid.uuid4()),
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        risk_type=risk_level,
        script=script,
        response=None
    )
    logs_db.append(log_entry)

    # Return data to frontend for call simulation
    return {
        "status": "call_initiated",
        "risk": risk_level,
        "rainfall_mm": rainfall,
        "audio_url": audio_url,
        "script": script,
        "call_id": log_entry.id
    }

@app.post("/respond/{call_id}")
async def record_response(call_id: str, response: str):
    """
    Record user's response (e.g., 'fever' or 'fine') for a given call.
    Frontend calls this when user presses a button.
    """
    for log in logs_db:
        if log.id == call_id:
            log.response = response
            return {"status": "ok", "message": "Response recorded"}
    raise HTTPException(status_code=404, detail="Call log not found")


# Tests
from services import lga_coords, hotspots, risk, weather

@app.get("/test-rainfall")
async def test_rainfall(lga: str):
    """Get total rainfall (mm) in last 24h for a given LGA."""
    coords = lga_coords.get_coordinates(lga)
    if not coords:
        raise HTTPException(status_code=404, detail=f"LGA '{lga}' not found in coordinates map")
    lat, lon = coords
    rainfall = await weather.get_rainfall(lat, lon)
    return {"lga": lga, "rainfall_mm": rainfall}

@app.get("/test-coordinates")
async def test_coordinates(lga: str):
    """Test LGA coordinate lookup."""
    coords = await lga_coords.get_coordinates(lga)
    if coords:
        return {"lga": lga, "coordinates": coords}
    return {"lga": lga, "error": "Coordinates not found"}

@app.get("/test-hotspot")
async def test_hotspot(lga: str):
    """Test if LGA is a disease hotspot."""
    info = hotspots.get_hotspot_info(lga)
    if info:
        return {"lga": lga, "is_hotspot": True, "details": info}
    return {"lga": lga, "is_hotspot": False}

@app.get("/test-risk")
async def test_risk(lga: str):
    """Test risk assessment: hotspot + rainfall."""
    coords = await lga_coords.get_coordinates(lga)
    if not coords:
        return {"lga": lga, "error": "Coordinates not found"}
    rainfall = await weather.get_rainfall(coords[0], coords[1])
    risk_level = risk.check_risk_for_lga(lga, rainfall)
    return {
        "lga": lga,
        "coordinates": coords,
        "rainfall_mm": rainfall,
        "is_hotspot": hotspots.is_hotspot(lga),
        "risk": risk_level
    }


# Optional: root endpoint
@app.get("/")
def root():
    return {"message": "Sabi Health API is running"}

import scheduler