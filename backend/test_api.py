import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing GET / ...")
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("  Root OK:", r.json()["service"])

    print("Testing GET /api/health ...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("  Health OK:", r.json()["status"], r.json()["algorithms"])

    print("Testing POST /api/auth/login (Valid credentials)...")
    r = client.post("/api/auth/login", json={"username": "operator", "password": "Flood@2026"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    token_data = r.json()
    token = token_data["access_token"]
    assert token, "Token must be returned"
    print("  Login OK. User:", token_data["user"]["full_name"])

    print("Testing POST /api/auth/login (Invalid credentials)...")
    r = client.post("/api/auth/login", json={"username": "operator", "password": "WrongPassword"})
    assert r.status_code == 401, "Expected 401 for invalid password"
    print("  Invalid login rejection OK")

    headers = {"Authorization": f"Bearer {token}"}
    print("Testing GET /api/auth/me ...")
    r = client.get("/api/auth/me", headers=headers)
    assert r.status_code == 200
    print("  /api/auth/me OK:", r.json()["email"])

    print("Testing GET /api/sensors/live ...")
    r = client.get("/api/sensors/live")
    assert r.status_code == 200
    data = r.json()
    print("  Live sensor data OK:", f"Water={data['water_level']}m, Rain={data['rainfall']}mm/h, Soil={data['soil_moisture']}%")

    print("Testing GET /api/sensors/history ...")
    r = client.get("/api/sensors/history")
    assert r.status_code == 200
    hist = r.json()
    assert len(hist["readings"]) > 0
    print(f"  Sensor history OK ({hist['total_count']} records)")

    print("Testing GET /api/prediction ...")
    r = client.get("/api/prediction")
    assert r.status_code == 200
    pred = r.json()
    assert len(pred["time_series"]) in (30, 31)
    print(f"  Prediction OK: Mean 30m={pred['mean_water_level']}m, Flood Prob={pred['flood_probability']}%, CI=[{pred['confidence_interval']['lower']}, {pred['confidence_interval']['upper']}]")

    print("Testing GET /api/risk ...")
    r = client.get("/api/risk")
    assert r.status_code == 200
    risk = r.json()
    print(f"  Risk Engine OK: Level={risk['risk_level']}, Action={risk['recommended_action'][:40]}...")

    print("Testing GET /api/map/sensors ...")
    r = client.get("/api/map/sensors")
    assert r.status_code == 200
    sensors = r.json()
    print(f"  Map Sensors OK: {len(sensors)} sensors found")

    print("Testing GET /api/map/shelters ...")
    r = client.get("/api/map/shelters")
    assert r.status_code == 200
    shelters = r.json()
    print(f"  Map Shelters OK: {len(shelters)} shelters found")

    print("Testing GET /api/evacuation/route ...")
    r = client.get("/api/evacuation/route")
    assert r.status_code == 200
    evac = r.json()
    dest = evac.get('destination_name') or (evac.get('destination_shelter', {}) if isinstance(evac.get('destination_shelter'), dict) else {}).get('name', 'Shelter')
    mins = evac.get('estimated_time_minutes') or evac.get('estimated_time_minutes_foot')
    print(f"  Dijkstra Evacuation Route OK: {evac.get('origin_name')} -> {dest}, Dist={evac.get('total_distance_km')}km, Foot Mins={mins}")

    print("Testing GET /api/alerts ...")
    r = client.get("/api/alerts")
    assert r.status_code == 200
    alerts = r.json()
    print(f"  Alerts OK: {len(alerts)} alerts logged")

    print("Testing POST /api/simulation/scenario (heavy) ...")
    r = client.post("/api/simulation/scenario", json={"scenario": "heavy"})
    assert r.status_code == 200
    print("  Scenario heavy OK:", r.json()["message"])

    print("Testing POST /api/simulation/scenario (extreme) ...")
    r = client.post("/api/simulation/scenario", json={"scenario": "extreme"})
    assert r.status_code == 200
    print("  Scenario extreme OK:", r.json()["message"])

    print("Testing POST /api/simulation/reset ...")
    r = client.post("/api/simulation/reset")
    assert r.status_code == 200
    print("  Scenario reset OK:", r.json()["message"])

    print("\n>>> ALL FASTAPI REST ENDPOINTS TESTED & VERIFIED 100%! <<<")

if __name__ == "__main__":
    test_endpoints()
