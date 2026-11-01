import pytest
from app.services.monte_carlo import MonteCarloFloodSimulator

def test_monte_carlo_normal_low_probability():
    sim = MonteCarloFloodSimulator(default_danger_threshold_m=3.50)
    result = sim.run_simulation(
        current_water_level=1.35,
        rainfall_intensity_mm_hr=5.0,
        soil_moisture_pct=35.0,
        sample_count=500
    )
    
    assert result["monte_carlo_samples"] == 500
    assert result["flood_probability"] <= 5.0
    assert result["mean_water_level"] < 2.0
    assert result["confidence_interval_95"]["lower"] < result["confidence_interval_95"]["upper"]
    assert "p50" in result["percentiles"]

def test_monte_carlo_cloudburst_high_probability():
    sim = MonteCarloFloodSimulator(default_danger_threshold_m=3.50)
    result = sim.run_simulation(
        current_water_level=3.20,
        rainfall_intensity_mm_hr=130.0,
        soil_moisture_pct=95.0,
        rate_of_rise=0.04,
        sample_count=500
    )
    
    assert result["flood_probability"] >= 75.0
    assert result["estimated_time_to_breach_min"] is not None
    assert result["mean_water_level"] >= 3.50
