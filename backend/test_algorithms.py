import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.algorithms import (
    WaterLevelKalmanFilter,
    RainfallRunoffHydrologyModel,
    MonteCarloSimulator,
    FloodProbabilityCalculator,
    RiskEngineWithHysteresis,
    EvacuationRoutingEngine
)
from app.services.sensor_simulator import simulation_service
from app.database.db import get_db_connection, verify_password

def test_all():
    print("[1/6] Testing Kalman Filter...")
    kf = WaterLevelKalmanFilter()
    flt, ror = kf.update(1.45)
    print(f"      Kalman output: level={flt}m, rate_of_rise={ror}m/min")
    assert flt > 0, "Kalman filter level must be positive"

    print("[2/6] Testing Rainfall-Runoff Hydrology Model...")
    hm = RainfallRunoffHydrologyModel()
    traj = hm.predict_deterministic_trajectory(1.45, 60.0, 75.0, 0.01)
    print(f"      Hydrology 30m trajectory points: {len(traj)}, 30m level={traj[-1]}m")
    assert len(traj) == 30, "Trajectory must have 30 points"

    print("[3/6] Testing Monte Carlo Simulator (200 scenarios)...")
    mc = MonteCarloSimulator(num_scenarios=200, horizon_minutes=30)
    mc_res = mc.run_simulation(1.45, 60.0, 75.0, 0.01)
    print(f"      Monte Carlo completed: mean={mc_res['mean_water_level']}m, CI=[{mc_res['ci_lower']}m, {mc_res['ci_upper']}m]")
    assert mc_res["scenarios_matrix"].shape == (200, 30), "Must be 200 scenarios x 30 minutes"

    print("[4/6] Testing Flood Probability Calculator...")
    fpc = FloodProbabilityCalculator(danger_threshold=3.5)
    prob = fpc.calculate_probability(mc_res["scenarios_matrix"])
    print(f"      Flood prob={prob['flood_probability']}%, time_to_breach={prob['estimated_time_to_breach_min']}")

    print("[5/6] Testing Risk Engine with Hysteresis...")
    re = RiskEngineWithHysteresis()
    risk = re.evaluate(prob["flood_probability"], 1.45, mc_res["mean_water_level"], mc_res["ci_lower"], mc_res["ci_upper"])
    print(f"      Risk classification: {risk['risk_level']}, color={risk['color_code']}")

    print("[6/6] Testing Dijkstra Evacuation Router...")
    er = EvacuationRoutingEngine()
    route = er.calculate_evacuation_route("LOC-AFFECTED", 1.45, risk["risk_level"])
    print(f"      Route calculated: {route['origin_name']} -> {route['destination_shelter']['name']}")
    print(f"      Total distance: {route['total_distance_km']}km, Waypoints: {len(route['route_polyline'])}, Steps: {len(route['steps'])}")
    assert len(route["route_polyline"]) >= 2, "Polyline must have points"

    print("\n[DB] Testing Database & Demo Users...")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT username, email, hashed_password, role FROM users")
    users = cur.fetchall()
    print(f"      Found {len(users)} seeded users:")
    for u in users:
        print(f"       - {u['username']} ({u['role']}) -> {u['email']}")
    assert len(users) >= 3, "Demo users must be present"
    
    # Test operator password verify
    op = next(u for u in users if u['username'] == 'operator')
    assert verify_password("Flood@2026", op['hashed_password']), "Password verification failed"
    print("      Password verification test passed!")

    print("\n[SERVICE] Testing Simulation Service Telemetry & Scenarios...")
    live = simulation_service.get_live_reading()
    print(f"      Live reading: Water={live['water_level']}m, Rain={live['rainfall']}mm/h, Soil={live['soil_moisture']}%")
    
    # Test Extreme scenario switch
    print("      Switching to 'extreme' cloudburst scenario...")
    simulation_service.set_scenario("extreme")
    ext_risk = simulation_service.get_risk()
    print(f"      Extreme scenario risk: {ext_risk['risk_level']} (Prob: {ext_risk['flood_probability']}%, Pred: {ext_risk['predicted_water_level_30m']}m)")
    
    # Reset back to normal
    simulation_service.reset_simulation()
    print("      Reset back to normal baseline.")

    print("\n>>> ALL BACKEND ALGORITHMS AND DATABASE TESTS PASSED 100%! <<<")

if __name__ == "__main__":
    test_all()
