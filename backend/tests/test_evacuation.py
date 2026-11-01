import pytest
from app.services.evacuation_router import DijkstraEvacuationRouter

def test_evacuation_routing_normal_conditions():
    router = DijkstraEvacuationRouter()
    route = router.calculate_safe_evacuation_route(
        current_water_level=1.35,
        risk_level="LOW"
    )
    
    assert route["status"] == "SUCCESS"
    assert route["total_distance_km"] > 0
    assert route["estimated_time_minutes"] > 0
    assert len(route["route_polyline"]) >= 2
    assert len(route["waypoints"]) >= 2
    assert route["destination_name"] == "Pine Ridge Community High Ground Shelter"

def test_evacuation_routing_flood_inundation_detour():
    router = DijkstraEvacuationRouter()
    # In critical flood, gorge road is impassable and must be bypassed
    route = router.calculate_safe_evacuation_route(
        current_water_level=3.85,
        risk_level="CRITICAL"
    )
    
    assert route["status"] == "SUCCESS"
    assert "Sector 4 Ridge Trail" in route["hazard_avoidance_notes"]
    # Ensure bridge node is not in path nodes when bridge is flooded
    node_names = [w["name"] for w in route["waypoints"]]
    assert "Old Valley River Bridge Crossing" not in node_names
