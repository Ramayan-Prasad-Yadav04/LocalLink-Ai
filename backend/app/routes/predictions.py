from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..schemas import PredictionResponse, PredictionRunRequest
from ..services.sensor_simulator import simulation_service
from ..websocket.manager import ws_manager

router = APIRouter(prefix="", tags=["Flash Flood Predictions"])

@router.get("/predictions/latest", response_model=Dict[str, Any])
@router.get("/prediction", response_model=Dict[str, Any])
async def get_latest_prediction():
    """
    Returns 30-minute flash flood water level forecast backed by kinematic wave
    catchment modeling and 1,000 Monte-Carlo stochastic scenarios.
    """
    pred = simulation_service.get_prediction()
    await ws_manager.broadcast_event("prediction_update", pred)
    return pred

@router.get("/predictions/history", response_model=Dict[str, Any])
async def get_prediction_history():
    """Returns recent prediction records for historical validation."""
    pred = simulation_service.get_prediction()
    return {
        "history": [pred],
        "count": 1,
        "model_version": "Kinematic-Wave-MC-v2",
        "is_simulated": True
    }

@router.post("/predictions/run", response_model=Dict[str, Any])
async def run_custom_prediction(req: PredictionRunRequest):
    """
    Executes an on-demand Monte Carlo flash flood prediction with custom parameters.
    """
    live = simulation_service.get_live_reading()
    
    current_h = req.current_water_level if req.current_water_level is not None else live["water_level"]
    rain = req.rainfall_rate if req.rainfall_rate is not None else live["rainfall"]
    soil = req.soil_moisture if req.soil_moisture is not None else live["soil_moisture"]

    pred = simulation_service.prediction_engine.predict_30m(
        current_water_level=current_h,
        rainfall_intensity_mm_hr=rain,
        soil_moisture_pct=soil
    )

    mc = simulation_service.monte_carlo.run_simulation(
        current_water_level=current_h,
        rainfall_intensity_mm_hr=rain,
        soil_moisture_pct=soil,
        sample_count=req.monte_carlo_samples,
        danger_threshold_m=req.danger_threshold_m
    )

    pred["flood_probability"] = mc["flood_probability"]
    pred["monte_carlo_samples"] = mc["monte_carlo_samples"]
    pred["estimated_time_to_breach_min"] = mc["estimated_time_to_breach_min"]
    pred["danger_threshold"] = req.danger_threshold_m
    pred["percentiles"] = mc["percentiles"]

    risk_res = simulation_service.risk_classifier.classify_risk(
        flood_probability=mc["flood_probability"],
        water_level=current_h,
        danger_threshold_m=req.danger_threshold_m
    )
    pred["risk_level"] = risk_res["risk_level"]

    await ws_manager.broadcast_event("prediction_update", pred)
    return pred
