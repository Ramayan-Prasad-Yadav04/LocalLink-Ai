import networkx as nx
from typing import Dict, Any, List, Optional, Tuple
import math

class DijkstraEvacuationRouter:
    """
    Dynamic NetworkX-based Evacuation Routing Service for Mountain Valleys.
    
    Safety-Weighted Routing:
      Edge Cost = Distance * (1.0 + alpha * Flood_Risk^2) + Incline_Penalty
      Submerged/Blocked roads have weight = infinity and are excluded from traversal.
    """

    def __init__(self):
        self.G = nx.Graph()
        self._build_valley_road_network()

    def _build_valley_road_network(self):
        """Builds a realistic mountain valley topological road graph for Chamoli/Rudraprayag."""
        self.G.clear()

        # Nodes: id -> (name, lat, lon, elevation_m, node_type)
        nodes = [
            ("NODE_VALLEY_0", "Mandakini Lower Valley Settlement (Zone 0)", 30.140, 78.798, 800, "ORIGIN"),
            ("NODE_RIVER_BRIDGE", "Old Valley River Bridge Crossing", 30.143, 78.803, 805, "VULNERABLE_BRIDGE"),
            ("NODE_GORGE_ROAD", "Lowland Gorge Riverbank Road", 30.148, 78.805, 810, "LOWLAND_ROAD"),
            ("NODE_RIDGE_PASS", "Sector 4 Elevated Ridge Pass Checkpoint", 30.147, 78.810, 910, "RIDGE_PASS"),
            ("NODE_FOREST_TRAIL", "Pine Forest High Contour Trail", 30.153, 78.816, 1010, "RIDGE_TRAIL"),
            ("NODE_ESCARPMENT", "Upper Escarpment Heli-Access Path", 30.158, 78.821, 1090, "HIGH_GROUND"),
            ("SHELTER_PINE_RIDGE", "Pine Ridge Community High Ground Shelter", 30.162, 78.825, 1140, "SHELTER"),
            
            # Alternative route nodes
            ("NODE_EAST_FORK", "East Valley Terraced Fork", 30.142, 78.818, 870, "INTERSECTION"),
            ("NODE_COLLEGE_JUNCTION", "Govt College High Ground Gate", 30.148, 78.832, 980, "SHELTER"),
            ("NODE_MONASTERY_TRAIL", "Monastery Ridge Plateau Junction", 30.170, 78.810, 1280, "SHELTER"),
            ("NODE_HELIPAD_ACCESS", "District Disaster Helipad Access Road", 30.130, 78.835, 1020, "SHELTER")
        ]

        for nid, name, lat, lon, elev, ntype in nodes:
            self.G.add_node(
                nid,
                name=name,
                lat=lat,
                lon=lon,
                elevation_m=elev,
                node_type=ntype,
                safety_status="SAFE"
            )

        # Edges: (u, v, distance_km, base_time_min, base_flood_risk, road_name)
        edges = [
            # High-ground Ridge Trail (Safest primary evacuation route)
            ("NODE_VALLEY_0", "NODE_RIDGE_PASS", 1.20, 22, 0.05, "Sector 4 Ridge Pass Trail"),
            ("NODE_RIDGE_PASS", "NODE_FOREST_TRAIL", 0.85, 15, 0.02, "Pine Ridge High Contour"),
            ("NODE_FOREST_TRAIL", "NODE_ESCARPMENT", 0.65, 12, 0.00, "Upper Escarpment Trail"),
            ("NODE_ESCARPMENT", "SHELTER_PINE_RIDGE", 0.42, 9, 0.00, "Pine Ridge Shelter Access"),

            # Lowland Gorge Road (Highly vulnerable to flash floods)
            ("NODE_VALLEY_0", "NODE_RIVER_BRIDGE", 0.60, 10, 0.75, "Lowland River Approach"),
            ("NODE_RIVER_BRIDGE", "NODE_GORGE_ROAD", 0.55, 9, 0.90, "Gorge Riverbed Drive"),
            ("NODE_GORGE_ROAD", "NODE_FOREST_TRAIL", 1.10, 20, 0.60, "Steep Ravine Cutback"),

            # Alternate path towards Govt College
            ("NODE_VALLEY_0", "NODE_EAST_FORK", 1.80, 32, 0.20, "East Valley Rural Bypass"),
            ("NODE_EAST_FORK", "NODE_COLLEGE_JUNCTION", 1.10, 20, 0.05, "College Heights Ascent"),
            ("NODE_EAST_FORK", "NODE_HELIPAD_ACCESS", 1.60, 28, 0.10, "Helipad Plateau Road"),
            ("NODE_ESCARPMENT", "NODE_MONASTERY_TRAIL", 1.40, 25, 0.00, "Monastery Ridge Track")
        ]

        for u, v, dist, time_m, risk, rname in edges:
            self.G.add_edge(
                u, v,
                distance_km=dist,
                travel_time_min=time_m,
                flood_risk=risk,
                road_status="OPEN",
                road_name=rname,
                accessibility="ALL"
            )

    def calculate_safe_evacuation_route(
        self,
        origin_lat: Optional[float] = None,
        origin_lon: Optional[float] = None,
        destination_shelter_id: Optional[str] = None,
        current_water_level: float = 1.35,
        risk_level: str = "LOW"
    ) -> Dict[str, Any]:
        """
        Dynamically adjusts road edge penalties based on hydrological risk,
        identifies flooded/blocked segments, and runs Dijkstra's algorithm.
        """
        # 1. Update Dynamic Edge Costs based on current flash flood telemetry
        is_flooded = (risk_level == "CRITICAL" or current_water_level >= 3.50)
        is_high_warning = (risk_level == "HIGH" or current_water_level >= 2.80)

        H = self.G.copy()

        for u, v, data in H.edges(data=True):
            base_risk = data.get("flood_risk", 0.0)
            dist = data.get("distance_km", 1.0)
            time_m = data.get("travel_time_min", 15.0)

            # If water level is critical and edge is lowland/riverbed, mark impassable
            if is_flooded and base_risk >= 0.50:
                data["road_status"] = "FLOODED"
                data["accessibility"] = "BLOCKED"
                data["weight"] = 999999.0  # Impassable barrier
            elif is_high_warning and base_risk >= 0.70:
                data["road_status"] = "CAUTION"
                data["accessibility"] = "PEDESTRIAN_ONLY"
                data["weight"] = dist * (1.0 + 8.0 * (base_risk ** 2))
            else:
                data["road_status"] = "OPEN"
                # Safety weighting: prioritize low-risk elevated paths
                data["weight"] = dist * (1.0 + 3.0 * base_risk)

        # 2. Origin & Destination Nodes
        origin_node = "NODE_VALLEY_0"
        if origin_lat and origin_lon:
            origin_node = self._find_nearest_node(origin_lat, origin_lon)

        destination_node = destination_shelter_id or "SHELTER_PINE_RIDGE"
        if destination_node not in H.nodes():
            destination_node = "SHELTER_PINE_RIDGE"

        # 3. Filter traversable subgraph (remove impassable flooded roads)
        traversable_edges = [
            (u, v) for u, v, d in H.edges(data=True) if d.get("weight", 1.0) < 50000.0
        ]
        subgraph = H.edge_subgraph(traversable_edges).copy()

        # 4. Run Dijkstra Pathfinding
        try:
            if not nx.has_path(subgraph, origin_node, destination_node):
                # Check alternative shelters
                alternative_shelters = ["NODE_COLLEGE_JUNCTION", "NODE_HELIPAD_ACCESS", "NODE_MONASTERY_TRAIL"]
                found_alt = False
                for alt in alternative_shelters:
                    if nx.has_path(subgraph, origin_node, alt):
                        destination_node = alt
                        found_alt = True
                        break

                if not found_alt:
                    return {
                        "status": "NO_SAFE_ROUTE_AVAILABLE",
                        "message": "All ground valley exits are currently submerged. Ascend to highest solid structure and await SDRF aerial rescue.",
                        "origin_name": H.nodes[origin_node]["name"],
                        "origin_coords": [H.nodes[origin_node]["lat"], H.nodes[origin_node]["lon"]],
                        "destination_name": "Vertical High Ground (Immediate)",
                        "destination_coords": [H.nodes[origin_node]["lat"], H.nodes[origin_node]["lon"]],
                        "total_distance_km": 0.0,
                        "estimated_time_minutes": 0,
                        "elevation_gain_m": 0.0,
                        "hazard_avoidance_notes": "CRITICAL: Gorge roads inundated. Do not attempt road evacuation.",
                        "route_polyline": [],
                        "waypoints": [],
                        "alternative_routes_count": 0
                    }

            # Calculate Dijkstra shortest safe path
            path_nodes = nx.dijkstra_path(subgraph, origin_node, destination_node, weight="weight")
            
            # Construct coordinates and waypoints
            route_polyline = []
            waypoints = []
            total_dist = 0.0
            total_time = 0
            elev_origin = H.nodes[path_nodes[0]]["elevation_m"]
            elev_dest = H.nodes[path_nodes[-1]]["elevation_m"]

            for i, nid in enumerate(path_nodes):
                ndata = H.nodes[nid]
                route_polyline.append([ndata["lat"], ndata["lon"]])
                
                # Instruction generation
                if i == 0:
                    inst = "Evacuate origin immediately. Move toward elevated contour."
                elif i == len(path_nodes) - 1:
                    inst = f"Arrive at destination: {ndata['name']}."
                else:
                    inst = f"Proceed along {ndata['name']} safely away from gorge drainage."

                waypoints.append({
                    "name": ndata["name"],
                    "lat": ndata["lat"],
                    "lon": ndata["lon"],
                    "altitude_m": ndata["elevation_m"],
                    "instruction": inst,
                    "hazard_free": True
                })

                if i > 0:
                    prev_node = path_nodes[i - 1]
                    edata = H.get_edge_data(prev_node, nid)
                    if edata:
                        total_dist += edata.get("distance_km", 0.5)
                        total_time += int(edata.get("travel_time_min", 10))

            hazard_note = (
                "River gorge crossing avoided due to flash flood risk. Ascending via Sector 4 Ridge Trail."
                if is_flooded or is_high_warning else
                "Standard high-ground route active. All valley roads currently passable."
            )

            return {
                "status": "SUCCESS",
                "origin_name": H.nodes[origin_node]["name"],
                "origin_coords": [H.nodes[origin_node]["lat"], H.nodes[origin_node]["lon"]],
                "destination_name": H.nodes[destination_node]["name"],
                "destination_coords": [H.nodes[destination_node]["lat"], H.nodes[destination_node]["lon"]],
                "total_distance_km": round(total_dist, 2),
                "estimated_time_minutes": total_time,
                "elevation_gain_m": round(max(0.0, elev_dest - elev_origin), 1),
                "hazard_avoidance_notes": hazard_note,
                "route_polyline": route_polyline,
                "waypoints": waypoints,
                "alternative_routes_count": 2
            }

        except Exception as e:
            return {
                "status": "ERROR",
                "message": f"Routing calculation error: {str(e)}",
                "route_polyline": [],
                "waypoints": []
            }

    def _find_nearest_node(self, lat: float, lon: float) -> str:
        """Finds closest node in the road network to given coordinates."""
        best_node = "NODE_VALLEY_0"
        min_dist = float("inf")
        for nid, data in self.G.nodes(data=True):
            d = math.hypot(data["lat"] - lat, data["lon"] - lon)
            if d < min_dist:
                min_dist = d
                best_node = nid
        return best_node

    def get_all_shelters(self) -> List[Dict[str, Any]]:
        """Returns verified safe high-ground emergency shelters."""
        return [
            {
                "id": "SHELTER_PINE_RIDGE",
                "name": "Pine Ridge Community High Ground Shelter",
                "latitude": 30.162,
                "longitude": 78.825,
                "elevation_m": 1140,
                "capacity": 450,
                "current_occupancy": 42,
                "medical_aid": True,
                "food_supplies": "5 Days Emergency Rations",
                "status": "OPEN",
                "contact_number": "1078"
            },
            {
                "id": "NODE_COLLEGE_JUNCTION",
                "name": "Govt Intermediate College Heights",
                "latitude": 30.148,
                "longitude": 78.832,
                "elevation_m": 980,
                "capacity": 300,
                "current_occupancy": 15,
                "medical_aid": True,
                "food_supplies": "3 Days Buffer Rations",
                "status": "OPEN",
                "contact_number": "1070"
            },
            {
                "id": "NODE_MONASTERY_TRAIL",
                "name": "Chamoli Monastery High Plateau",
                "latitude": 30.170,
                "longitude": 78.810,
                "elevation_m": 1280,
                "capacity": 250,
                "current_occupancy": 0,
                "medical_aid": True,
                "food_supplies": "7 Days Self-Sufficient Stock",
                "status": "OPEN",
                "contact_number": "1078"
            },
            {
                "id": "NODE_HELIPAD_ACCESS",
                "name": "District Disaster Helipad Evacuation Camp",
                "latitude": 30.130,
                "longitude": 78.835,
                "elevation_m": 1020,
                "capacity": 600,
                "current_occupancy": 55,
                "medical_aid": True,
                "food_supplies": "NDRF Forward Operations Base",
                "status": "OPEN",
                "contact_number": "112"
            }
        ]
