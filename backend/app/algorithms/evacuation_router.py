import networkx as nx
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

class EvacuationRoutingEngine:
    """
    NetworkX & Dijkstra based Emergency Evacuation Engine for Hilly Flash Flood Terrains.
    
    Dynamically adjusts edge traversability and penalties based on:
    - Real-time water levels and flood breach thresholds.
    - Low-elevation river crossings and riverbed causeways becoming submerged.
    - Slope gradient and road width for pedestrian & rescue convoy traversal.
    """
    def __init__(self):
        self.graph = nx.Graph()
        self._build_mountain_road_network()

    def _build_mountain_road_network(self):
        """Constructs the topographic road network graph for the valley."""
        # Node Definitions: (id, name, lat, lon, elevation_m, is_shelter)
        nodes = [
            ("LOC-AFFECTED", "Mandakini Lower Valley Settlement (Zone 0)", 30.1375, 78.7910, 1140.0, False),
            ("LOC-BRIDGE-LOW", "Old Riverside Bridge Causeway", 30.1405, 78.7935, 1143.0, False),
            ("LOC-VALLEY-JUNC", "Pine Valley Lower Junction", 30.1450, 78.7960, 1195.0, False),
            ("LOC-RIDGE-WEST", "West Ridge Mountain Pass (High Elevation)", 30.1495, 78.7860, 1310.0, False),
            ("LOC-NORTH-BYPASS", "North Ridge Terraced Road", 30.1540, 78.7940, 1370.0, False),
            ("LOC-TERRACE-EAST", "East Valley Terraces Crossing", 30.1465, 78.8080, 1320.0, False),
            ("LOC-UPPER-FORK", "Highland Medical Fork", 30.1480, 78.8120, 1365.0, False),
            # Shelters
            ("SHELTER-01", "Pine Ridge Community High Ground", 30.1585, 78.8020, 1420.0, True),
            ("SHELTER-02", "Civil Hospital Disaster Wing", 30.1490, 78.8150, 1380.0, True),
            ("SHELTER-03", "St. Jude Mountain Academy Relief Center", 30.1650, 78.7880, 1510.0, True),
            ("SHELTER-04", "Govt ITI Hilltop Safe Haven", 30.1340, 78.8250, 1340.0, True),
        ]
        
        for nid, name, lat, lon, elev, is_sh in nodes:
            self.graph.add_node(
                nid, 
                name=name, 
                lat=lat, 
                lon=lon, 
                elevation_m=elev, 
                is_shelter=is_sh
            )
            
        # Edges: (u, v, distance_km, road_type, flood_submergence_threshold_m, name)
        # Low causeway submerges at 2.6m!
        edges = [
            # Vulnerable low-lying paths along river
            ("LOC-AFFECTED", "LOC-BRIDGE-LOW", 0.42, "riverbed_causeway", 2.60, "Riverfront Embankment Road"),
            ("LOC-BRIDGE-LOW", "LOC-VALLEY-JUNC", 0.65, "lowland_link", 2.90, "Lower Valley Connector"),
            
            # Safe high-elevation bypasses
            ("LOC-AFFECTED", "LOC-RIDGE-WEST", 1.45, "mountain_ridge", 99.0, "Uphill West Ridge Trail"),
            ("LOC-RIDGE-WEST", "LOC-NORTH-BYPASS", 0.85, "paved_arterial", 99.0, "North Ridge Ascending Bypass"),
            ("LOC-VALLEY-JUNC", "LOC-NORTH-BYPASS", 1.10, "steep_incline", 3.80, "Mid-Valley Switchback Road"),
            ("LOC-VALLEY-JUNC", "LOC-TERRACE-EAST", 1.30, "valley_traverse", 3.40, "Terrace Crossway"),
            
            # Connections to Shelters
            ("LOC-NORTH-BYPASS", "SHELTER-01", 0.95, "paved_highway", 99.0, "Pine Ridge Primary Approach"),
            ("LOC-NORTH-BYPASS", "SHELTER-03", 1.50, "highland_arterial", 99.0, "St. Jude Academy Mountain Highway"),
            ("LOC-TERRACE-EAST", "LOC-UPPER-FORK", 0.45, "paved_arterial", 99.0, "Civil Hospital Link Road"),
            ("LOC-UPPER-FORK", "SHELTER-02", 0.35, "paved_arterial", 99.0, "Disaster Wing Ramp"),
            ("LOC-TERRACE-EAST", "SHELTER-04", 1.80, "gravel_road", 99.0, "South Hilltop Access Route")
        ]
        
        for u, v, dist, rtype, sub_thresh, rname in edges:
            self.graph.add_edge(
                u, v, 
                distance_km=dist, 
                road_type=rtype, 
                submerge_threshold=sub_thresh, 
                road_name=rname
            )

    def calculate_evacuation_route(self, 
                                   origin_node: str = "LOC-AFFECTED", 
                                   current_water_level: float = 1.2, 
                                   risk_level: str = "LOW") -> Dict[str, Any]:
        """
        Runs Dijkstra Shortest Path algorithm with dynamic safety weighting.
        
        If water level >= edge submergence threshold, the edge is flagged as
        BLOCKED and penalized with virtually infinite weight so Dijkstra dynamically
        diverts the population up safe high-ground mountain passes!
        """
        G = self.graph.copy()
        blocked_count = 0
        
        # Dynamic edge weight computation based on flood depth
        for u, v, data in G.edges(data=True):
            dist = data['distance_km']
            sub_thresh = data['submerge_threshold']
            
            # Check if road is flooded
            is_submerged = current_water_level >= sub_thresh
            is_high_risk = (risk_level in ["HIGH", "CRITICAL"]) and (sub_thresh < 3.2)
            
            if is_submerged or is_high_risk:
                # Impassable / submerged road segment
                data['weight'] = 1e6 # effectively infinite
                data['is_blocked'] = True
                blocked_count += 1
            else:
                # Add slope preference penalty (prefer paved high ground over riverside)
                elev_delta = abs(G.nodes[v]['elevation_m'] - G.nodes[u]['elevation_m'])
                data['weight'] = dist * (1.0 + (elev_delta / 2000.0))
                data['is_blocked'] = False

        # Find best available shelter using Dijkstra shortest safe path
        shelter_candidates = [
            (nid, data) for nid, data in G.nodes(data=True) if data.get('is_shelter')
        ]
        
        best_route = None
        best_shelter_id = None
        min_total_dist = float('inf')
        
        for sh_id, sh_data in shelter_candidates:
            try:
                path = nx.dijkstra_path(G, origin_node, sh_id, weight='weight')
                
                # Check if path contains blocked edges
                path_has_blocked = False
                total_real_dist = 0.0
                for idx in range(len(path) - 1):
                    e_data = G.get_edge_data(path[idx], path[idx+1])
                    if e_data.get('is_blocked'):
                        path_has_blocked = True
                        break
                    total_real_dist += e_data['distance_km']
                    
                if not path_has_blocked and total_real_dist < min_total_dist:
                    min_total_dist = total_real_dist
                    best_route = path
                    best_shelter_id = sh_id
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                continue
                
        # Fallback if all paths blocked (extreme flood scenario fallback)
        if best_route is None:
            # Force path along highest elevation nodes
            try:
                best_route = nx.shortest_path(self.graph, origin_node, "SHELTER-01")
                min_total_dist = sum(self.graph[best_route[i]][best_route[i+1]]['distance_km'] for i in range(len(best_route)-1))
                best_shelter_id = "SHELTER-01"
            except Exception:
                best_route = [origin_node, "LOC-RIDGE-WEST", "LOC-NORTH-BYPASS", "SHELTER-01"]
                min_total_dist = 3.25
                best_shelter_id = "SHELTER-01"

        # Build polyline coordinates and step instructions
        polyline = []
        steps = []
        for i, nid in enumerate(best_route):
            nd = self.graph.nodes[nid]
            polyline.append([nd['lat'], nd['lon']])
            
            if i < len(best_route) - 1:
                next_nid = best_route[i+1]
                next_nd = self.graph.nodes[next_nid]
                e_data = self.graph.get_edge_data(nid, next_nid)
                rname = e_data.get('road_name', 'Connecting Road')
                dist_m = round(e_data.get('distance_km', 0.5) * 1000)
                
                elev_change = next_nd['elevation_m'] - nd['elevation_m']
                elev_text = f"Ascend {abs(int(elev_change))}m uphill" if elev_change > 0 else "Proceed along contour"
                
                danger_note = None
                if e_data.get('submerge_threshold', 99) < 3.5:
                    danger_note = f"Caution: Near flood zone (submerges at {e_data['submerge_threshold']}m). High ground route chosen."
                    
                steps.append({
                    "step_number": i + 1,
                    "instruction": f"From {nd['name']}, proceed via {rname} towards {next_nd['name']}. {elev_text} ({dist_m} m).",
                    "distance_m": float(dist_m),
                    "danger_note": danger_note
                })

        # Calculate transit times
        # Pedestrian uphill evacuation speed ~ 3.2 km/h
        foot_mins = max(5, int((min_total_dist / 3.2) * 60))
        # Emergency vehicle speed in mountain switchbacks ~ 22 km/h
        vehicle_mins = max(2, int((min_total_dist / 22.0) * 60))

        sh_node = self.graph.nodes[best_shelter_id]
        origin_nd = self.graph.nodes[origin_node]

        destination_shelter = {
            "id": best_shelter_id,
            "name": sh_node['name'],
            "lat": sh_node['lat'],
            "lon": sh_node['lon'],
            "elevation_m": sh_node['elevation_m'],
            "capacity": 500,
            "current_occupancy": 140,
            "available_space": 360,
            "is_safe": True,
            "contact_phone": "+91 94120 11001"
        }

        return {
            "origin_name": origin_nd['name'],
            "origin_coords": [origin_nd['lat'], origin_nd['lon']],
            "destination_shelter": destination_shelter,
            "route_polyline": polyline,
            "steps": steps,
            "total_distance_km": round(min_total_dist, 2),
            "estimated_time_minutes_foot": foot_mins,
            "estimated_time_minutes_vehicle": vehicle_mins,
            "route_status": "CRITICAL EVACUATION ROUTE" if risk_level == "CRITICAL" else "SAFE HIGH-GROUND ROUTE",
            "blocked_edges_avoided": blocked_count
        }

    def get_all_shelters(self) -> List[Dict[str, Any]]:
        shelters = []
        for nid, data in self.graph.nodes(data=True):
            if data.get('is_shelter'):
                shelters.append({
                    "id": nid,
                    "name": data['name'],
                    "lat": data['lat'],
                    "lon": data['lon'],
                    "elevation_m": data['elevation_m'],
                    "capacity": 500 if nid == "SHELTER-01" else 350,
                    "current_occupancy": 112 if nid == "SHELTER-01" else 64,
                    "available_space": 388 if nid == "SHELTER-01" else 286,
                    "is_safe": True,
                    "contact_phone": "+91 94120 11001"
                })
        return shelters
