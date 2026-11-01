from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from ..services.sensor_simulator import simulation_service
from ..websocket.manager import ws_manager

router = APIRouter(prefix="/simulation", tags=["Simulation Control"])

class SimulationScenarioRequest(BaseModel):
    scenario: str  # normal | warning | extreme | heavy

@router.post("/scenario", response_model=Dict[str, Any])
async def set_scenario(req: SimulationScenarioRequest):
    """Trigger Demo Mode scenario switch (Normal, Warning, Extreme Cloudburst)."""
    try:
        simulation_service.set_scenario(req.scenario)
        live = simulation_service.get_live_reading()
        await ws_manager.broadcast_event("sensor_update", live)
        return {
            "current_scenario": simulation_service.scenario,
            "rainfall_base": simulation_service.base_rainfall,
            "soil_moisture_base": simulation_service.base_soil_moisture,
            "water_level_base": simulation_service.base_water_level,
            "message": f"Successfully activated '{req.scenario.upper()}' simulation scenario."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset", response_model=Dict[str, Any])
async def reset_simulation():
    """Resets environmental sensors, Kalman states, and risk levels to baseline."""
    simulation_service.reset_simulation()
    live = simulation_service.get_live_reading()
    await ws_manager.broadcast_event("sensor_update", live)
    return {
        "current_scenario": "normal",
        "rainfall_base": simulation_service.base_rainfall,
        "soil_moisture_base": simulation_service.base_soil_moisture,
        "water_level_base": simulation_service.base_water_level,
        "message": "Simulation telemetry and Kalman states reset to baseline."
    }
