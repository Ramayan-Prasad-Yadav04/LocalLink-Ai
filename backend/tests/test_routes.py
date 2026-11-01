import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "algorithms" in data
    assert data["algorithms"]["kalman_filter"] == "operational"

def test_sensors_endpoints():
    # GET /api/sensors
    res = client.get("/api/sensors")
    assert res.status_code == 200
    stations = res.json()
    assert len(stations) >= 4
    assert stations[0]["is_simulated"] is True

    # GET /api/sensors/live
    res_live = client.get("/api/sensors/live")
    assert res_live.status_code == 200
    data_live = res_live.json()
    assert "water_level" in data_live
    assert "rainfall" in data_live

    # POST /api/sensors/simulate
    res_sim = client.post("/api/sensors/simulate", json={"scenario": "warning"})
    assert res_sim.status_code == 200
    assert res_sim.json()["scenario"] == "warning"

def test_predictions_endpoints():
    # GET /api/predictions/latest
    res = client.get("/api/predictions/latest")
    assert res.status_code == 200
    data = res.json()
    assert data["prediction_lead_minutes"] == 30
    assert len(data["time_series"]) == 31

    # POST /api/predictions/run
    res_run = client.post("/api/predictions/run", json={
        "current_water_level": 2.2,
        "rainfall_rate": 35.0,
        "soil_moisture": 60.0,
        "monte_carlo_samples": 200
    })
    assert res_run.status_code == 200
    data_run = res_run.json()
    assert "flood_probability" in data_run

def test_risk_endpoints():
    res = client.get("/api/risk")
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] in ("LOW", "MODERATE", "HIGH", "CRITICAL")
    assert "recommended_action" in data

def test_evacuation_endpoints():
    # GET /api/evacuation/route
    res = client.get("/api/evacuation/route")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["total_distance_km"] > 0

    # GET /api/evacuation/shelters
    res_shelters = client.get("/api/evacuation/shelters")
    assert res_shelters.status_code == 200
    shelters = res_shelters.json()
    assert len(shelters) >= 4

def test_map_endpoints():
    # GET /api/map/sensors
    res_sensors = client.get("/api/map/sensors")
    assert res_sensors.status_code == 200

    # GET /api/map/risk-zones
    res_zones = client.get("/api/map/risk-zones")
    assert res_zones.status_code == 200
    assert len(res_zones.json()) >= 4

    # GET /api/map/shelters
    res_shelters = client.get("/api/map/shelters")
    assert res_shelters.status_code == 200

def test_alerts_endpoints():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # POST /api/alerts/test
    res_test = client.post("/api/alerts/test", json={"risk_level": "HIGH"})
    assert res_test.status_code == 200
    assert res_test.json()["risk_level"] == "HIGH"

def test_analytics_endpoints():
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["system_status"] == "ONLINE"
    assert "monte_carlo_scenarios_configured" in data
