from fastapi import APIRouter
from typing import Dict, Any
from ..schemas import RiskAssessmentResponse
from ..services.sensor_simulator import simulation_service
from ..websocket.manager import ws_manager

router = APIRouter(prefix="/risk", tags=["Risk Classification"])

@router.get("", response_model=Dict[str, Any])
async def get_current_risk():
    """
    Returns stateful flash flood risk assessment with hysteresis dampening
    and actionable civil defense directives.
    """
    risk_res = simulation_service.get_risk()
    await ws_manager.broadcast_event("risk_update", risk_res)
    return risk_res

@router.get("/{location_id}", response_model=Dict[str, Any])
async def get_location_risk(location_id: str):
    """Retrieve risk assessment for a specific valley zone or community settlement."""
    risk_res = simulation_service.get_risk()
    risk_res["location_id"] = location_id
    return risk_res
