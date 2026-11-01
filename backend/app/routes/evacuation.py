from fastapi import APIRouter
from typing import Dict, Any, List
from ..schemas import EvacuationRouteResponse, EvacuationRouteRequest, ShelterResponse
from ..services.sensor_simulator import simulation_service
from ..websocket.manager import ws_manager

router = APIRouter(prefix="/evacuation", tags=["Dijkstra Evacuation Routing"])

@router.get("/route", response_model=Dict[str, Any])
async def get_default_evacuation_route():
    """
    Returns NetworkX Dijkstra optimal safe evacuation path from Zone 0 Lowlands
    to the nearest accessible high-ground shelter, avoiding flooded road segments.
    """
    route = simulation_service.get_evacuation_route()
    await ws_manager.broadcast_event("evacuation_update", route)
    return route

@router.post("/route", response_model=Dict[str, Any])
async def calculate_custom_evacuation_route(req: EvacuationRouteRequest):
    """
    Calculates dynamic Dijkstra shortest safe path from a user-specified coordinate
    to a designated high-ground shelter, penalizing or excluding flooded roads.
    """
    route = simulation_service.get_evacuation_route(
        origin_lat=req.origin_latitude,
        origin_lon=req.origin_longitude,
        shelter_id=req.destination_shelter_id
    )
    await ws_manager.broadcast_event("evacuation_update", route)
    return route

@router.get("/shelters", response_model=List[Dict[str, Any]])
async def get_all_evacuation_shelters():
    """Returns high-ground emergency shelters with remaining capacities, altitude, and provisions."""
    return simulation_service.evacuation_router.get_all_shelters()
