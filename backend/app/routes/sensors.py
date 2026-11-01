from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..schemas import SensorResponse, SensorCreate, SensorReadingResponse, SensorSimulateRequest
from ..services.sensor_simulator import simulation_service
from ..websocket.manager import ws_manager

router = APIRouter(prefix="/sensors", tags=["Sensors & Telemetry"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_sensors():
    """Retrieve all monitored hydrological and meteorological sensor stations."""
    return simulation_service.get_all_stations()

@router.get("/live", response_model=Dict[str, Any])
async def get_live_sensor_reading():
    """
    Returns real-time 2-second telemetry reading filtered by 1D Kalman Filter.
    Strictly labelled as SIMULATED to comply with research transparency guidelines.
    """
    reading = simulation_service.get_live_reading()
    # Trigger WebSocket event in background
    await ws_manager.broadcast_event("sensor_update", reading)
    return reading

@router.get("/history", response_model=Dict[str, Any])
async def get_sensor_history():
    """Returns historical time-series of sensor readings for charting."""
    readings = simulation_service.get_history()
    return {
        "readings": readings,
        "total_count": len(readings),
        "is_simulated": True
    }

@router.get("/{sensor_id}", response_model=Dict[str, Any])
async def get_sensor_by_id(sensor_id: str):
    """Retrieve details and live telemetry for a specific sensor node."""
    stations = simulation_service.get_all_stations()
    for s in stations:
        if s["id"] == sensor_id:
            return s
    raise HTTPException(status_code=404, detail=f"Sensor station '{sensor_id}' not found.")

@router.post("", response_model=Dict[str, Any])
async def register_sensor(sensor: SensorCreate):
    """Register a new sensor station in the hydrological monitoring network."""
    new_station = sensor.dict()
    new_station["is_simulated"] = True
    new_station["data_source"] = "SIMULATED"
    new_station["last_reading"] = {
        "water_level": 1.35,
        "rainfall": 5.0,
        "soil_moisture": 38.0
    }
    simulation_service.stations.append(new_station)
    return new_station

@router.post("/simulate", response_model=Dict[str, Any])
async def simulate_sensor_scenario(req: SensorSimulateRequest):
    """
    Controls Demo Mode simulation scenario:
    Options: 'normal', 'warning', or 'extreme'.
    """
    try:
        simulation_service.set_scenario(req.scenario)
        live = simulation_service.get_live_reading()
        await ws_manager.broadcast_event("sensor_update", live)
        return {
            "status": "success",
            "scenario": req.scenario,
            "message": f"Successfully activated '{req.scenario.upper()}' simulation scenario.",
            "current_reading": live,
            "is_simulated": True
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
