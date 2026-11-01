from fastapi import APIRouter
from typing import Dict, Any, List
from ..services.sensor_simulator import simulation_service

router = APIRouter(prefix="/map", tags=["Geospatial Map Data"])

@router.get("/sensors", response_model=List[Dict[str, Any]])
async def get_map_sensor_nodes():
    """Returns geographic coordinates and live operational status of all river and ridge sensors."""
    return simulation_service.get_all_stations()

@router.get("/shelters", response_model=List[Dict[str, Any]])
async def get_map_safe_shelters():
    """Returns verified high-ground evacuation shelters, altitude, and capacities."""
    return simulation_service.evacuation_router.get_all_shelters()

@router.get("/risk-zones", response_model=List[Dict[str, Any]])
async def get_map_flood_risk_zones():
    """Returns color-coded flood inundation risk polygons for valley visualization."""
    return [
        {
            "id": "ZONE-RED-CRITICAL",
            "name": "Zone 0: Lowland River Gorge Basin",
            "level": "CRITICAL",
            "color": "#EF4444",
            "description": "Active flood corridor. Inundation risk > 90% during cloudburst events. Immediate evacuation required.",
            "coordinates": [
                [30.144, 78.792],
                [30.152, 78.798],
                [30.146, 78.808],
                [30.138, 78.804]
            ]
        },
        {
            "id": "ZONE-ORANGE-HIGH",
            "name": "Zone 1: Lower Valley Settlement Plains",
            "level": "HIGH",
            "color": "#F97316",
            "description": "Vulnerable flood plains. Water overflow occurs when stream gauge exceeds 2.80m.",
            "coordinates": [
                [30.153, 78.798],
                [30.160, 78.804],
                [30.152, 78.815],
                [30.146, 78.808]
            ]
        },
        {
            "id": "ZONE-YELLOW-MODERATE",
            "name": "Zone 2: Terraced Agricultural Bank",
            "level": "MODERATE",
            "color": "#F59E0B",
            "description": "Moderate terrace elevation. Saturated topsoil generates fast surface runoff.",
            "coordinates": [
                [30.160, 78.804],
                [30.167, 78.812],
                [30.159, 78.822],
                [30.152, 78.815]
            ]
        },
        {
            "id": "ZONE-GREEN-LOW",
            "name": "Zone 3: Elevated Highland Plateau",
            "level": "LOW",
            "color": "#10B981",
            "description": "Safe elevated high-ground. Minimal flash flood risk. Location of emergency community shelters.",
            "coordinates": [
                [30.158, 78.819],
                [30.172, 78.818],
                [30.168, 78.834],
                [30.156, 78.832]
            ]
        }
    ]
