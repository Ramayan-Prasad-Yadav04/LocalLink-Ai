import pytest
from app.services.flood_prediction import HydrologicalPredictionEngine

def test_flood_prediction_engine_normal_flow():
    engine = HydrologicalPredictionEngine()
    result = engine.predict_30m(
        current_water_level=1.35,
        rainfall_intensity_mm_hr=5.0,
        soil_moisture_pct=38.0,
        rate_of_rise_m_min=0.001
    )
    
    assert result["prediction_lead_minutes"] == 30
    assert result["current_water_level"] == 1.35
    assert result["predicted_water_level"] >= 1.35
    assert len(result["time_series"]) == 31
    assert result["ci_lower_95"] <= result["predicted_water_level"] <= result["ci_upper_95"]

def test_flood_prediction_engine_cloudburst_surge():
    engine = HydrologicalPredictionEngine()
    result = engine.predict_30m(
        current_water_level=2.80,
        rainfall_intensity_mm_hr=120.0,
        soil_moisture_pct=92.0,
        rate_of_rise_m_min=0.03
    )
    
    # Cloudburst with saturated soil should produce significant water stage rise
    assert result["predicted_water_level"] > 3.40
    assert result["predicted_change"] > 0.50
    assert result["time_series"][-1]["minute"] == 30
