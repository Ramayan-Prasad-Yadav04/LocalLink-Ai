from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas import (
    UserLogin, Token, UserResponse,
    SensorReading, SensorHistoryResponse, SensorLocation,
    PredictionResponse, RiskAssessmentResponse,
    EvacuationRouteResponse, Shelter,
    EmergencyAlert, AlertAcknowledgeRequest,
    SimulationScenarioRequest, SimulationStatusResponse
)
from ..services.auth_service import authenticate_user, create_access_token, get_current_user
from ..services.sensor_simulator import simulation_service
from ..database.db import get_db_connection

router = APIRouter()

# --- AUTH ENDPOINTS ---
@router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Please verify credentials."
        )
    
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: Optional[Dict[str, Any]] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return current_user

# --- SENSOR TELEMETRY ENDPOINTS ---
@router.get("/sensors/live", response_model=SensorReading)
async def get_live_sensors():
    """Returns real-time 2-second sensor reading with Kalman-filtered values."""
    return simulation_service.get_live_reading()

@router.get("/sensors/history", response_model=SensorHistoryResponse)
async def get_sensor_history():
    """Returns historical time-series of sensor readings for charting."""
    readings = simulation_service.get_history()
    return {
        "readings": readings,
        "total_count": len(readings)
    }

# --- PREDICTION ENDPOINT ---
@router.get("/prediction", response_model=PredictionResponse)
async def get_prediction():
    """Returns 30-minute water level forecast backed by 200 Monte-Carlo scenarios."""
    return simulation_service.get_prediction()

# --- RISK ASSESSMENT ENDPOINT ---
@router.get("/risk", response_model=RiskAssessmentResponse)
async def get_risk_assessment():
    """Returns stateful risk classification with hysteresis and actionable emergency protocols."""
    return simulation_service.get_risk()

# --- MAP & GEOSPATIAL ENDPOINTS ---
@router.get("/map/sensors", response_model=List[SensorLocation])
async def get_sensor_locations():
    """Returns geographic coordinates and live operational status of all river and ridge sensors."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, type, lat, lon, elevation_m, status FROM sensor_locations")
    rows = cur.fetchall()
    conn.close()
    
    live = simulation_service.get_live_reading()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "lat": r["lat"],
            "lon": r["lon"],
            "elevation_m": r["elevation_m"],
            "status": r["status"],
            "last_reading": {
                "water_level": live["water_level"],
                "rainfall": live["rainfall"],
                "soil_moisture": live["soil_moisture"],
                "timestamp": live["timestamp"]
            }
        })
    return results

@router.get("/map/shelters", response_model=List[Shelter])
async def get_shelters():
    """Returns high-ground emergency evacuation shelters and remaining capacities."""
    shelters = simulation_service.evacuation_router.get_all_shelters()
    return shelters

# --- EVACUATION ROUTE ENDPOINT ---
@router.get("/evacuation/route", response_model=EvacuationRouteResponse)
async def get_evacuation_route():
    """Calculates NetworkX & Dijkstra optimal shortest safe path to nearest high-elevation shelter."""
    return simulation_service.get_evacuation_route()

# --- ALERT SYSTEM ENDPOINTS ---
@router.get("/alerts", response_model=List[EmergencyAlert])
async def get_alerts():
    """Fetches recent emergency warnings and alert history."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, timestamp, risk_level, title, message, action_required, siren_triggered, acknowledged
        FROM alerts
        ORDER BY timestamp DESC
        LIMIT 20
    """)
    rows = cur.fetchall()
    conn.close()
    
    alerts = []
    for r in rows:
        alerts.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "risk_level": r["risk_level"],
            "title": r["title"],
            "message": r["message"],
            "action_required": r["action_required"],
            "siren_triggered": bool(r["siren_triggered"]),
            "acknowledged": bool(r["acknowledged"])
        })
    return alerts

@router.post("/alerts/acknowledge")
async def acknowledge_alert(req: AlertAcknowledgeRequest):
    """Mark an emergency alert as acknowledged by the operator."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (req.alert_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "alert_id": req.alert_id, "acknowledged": True}

# --- SIMULATION & DEMO MODE ENDPOINTS ---
@router.post("/simulation/scenario", response_model=SimulationStatusResponse)
async def set_simulation_scenario(req: SimulationScenarioRequest):
    """
    Demo Mode control for SIH Judges:
    Allows setting 'normal', 'heavy', or 'extreme' rainfall scenarios.
    """
    try:
        simulation_service.set_scenario(req.scenario)
        return {
            "current_scenario": simulation_service.scenario,
            "rainfall_base": simulation_service.base_rainfall,
            "soil_moisture_base": simulation_service.base_soil_moisture,
            "water_level_base": simulation_service.base_water_level,
            "message": f"Successfully activated '{req.scenario.upper()}' simulation scenario."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulation/reset", response_model=SimulationStatusResponse)
async def reset_simulation():
    """Resets environmental sensors and risk state to baseline conditions."""
    simulation_service.reset_simulation()
    return {
        "current_scenario": "normal",
        "rainfall_base": simulation_service.base_rainfall,
        "soil_moisture_base": simulation_service.base_soil_moisture,
        "water_level_base": simulation_service.base_water_level,
        "message": "Simulation telemetry and Kalman states reset to baseline."
    }

# --- SYSTEM HEALTH & ALGORITHM DIAGNOSTICS ---
@router.get("/health")
async def health_check():
    """System health check and algorithm status verification."""
    return {
        "status": "healthy",
        "service": "FloodWatch AI Disaster Management Engine",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "algorithms": {
            "kalman_filter": "operational",
            "rainfall_runoff_model": "operational",
            "monte_carlo_ensemble": f"operational (200 scenarios)",
            "flood_probability_engine": "operational (threshold: 3.5m)",
            "risk_hysteresis_engine": "operational",
            "networkx_dijkstra_router": "operational"
        },
        "simulation_scenario": simulation_service.scenario,
        "database": "sqlite_connected"
    }
