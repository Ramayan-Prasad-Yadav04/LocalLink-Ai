from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime
from ..services.sensor_simulator import simulation_service
from ..config import settings

router = APIRouter(prefix="/analytics", tags=["Analytics & Diagnostics"])

@router.get("/summary", response_model=Dict[str, Any])
async def get_analytics_summary():
    """
    Returns aggregated real-time operational metrics across all monitored stations,
    risk indices, and model performance.
    """
    live = simulation_service.get_live_reading()
    pred = simulation_service.get_prediction()
    stations = simulation_service.get_all_stations()

    return {
        "system_status": "ONLINE",
        "active_sensors_count": len(stations),
        "active_warnings_count": 1 if pred["risk_level"] in ("HIGH", "CRITICAL") else 0,
        "safe_shelters_count": len(simulation_service.evacuation_router.get_all_shelters()),
        "current_river_level_mean": live["water_level"],
        "current_rainfall_mean": live["rainfall"],
        "soil_saturation_mean": live["soil_moisture"],
        "monte_carlo_scenarios_configured": settings.DEFAULT_MONTE_CARLO_SAMPLES,
        "prediction_lead_minutes": 30,
        "danger_threshold_m": settings.DEFAULT_DANGER_THRESHOLD_METERS,
        "current_scenario": simulation_service.scenario,
        "last_updated": datetime.utcnow().isoformat(),
        "is_simulated": True
    }

@router.get("/history", response_model=Dict[str, Any])
async def get_analytics_history():
    """Returns chronological telemetry and prediction records for statistical analysis."""
    history = simulation_service.get_history()
    return {
        "records": history,
        "total_records": len(history),
        "is_simulated": True
    }
