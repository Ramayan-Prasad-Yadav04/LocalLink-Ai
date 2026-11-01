import random
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import numpy as np

from .kalman_filter import HydrologicalKalmanFilter
from .flood_prediction import HydrologicalPredictionEngine
from .monte_carlo import MonteCarloFloodSimulator
from .risk_classifier import RiskClassificationEngine
from .evacuation_router import DijkstraEvacuationRouter
from .alert_service import alert_service
from ..config import settings

class EnvironmentalSensorSimulator:
    """
    Comprehensive Environmental Sensor Simulation System for Hilly River Basins.
    
    IMPORTANT: All simulated readings are strictly marked as 'is_simulated: True'
    and 'data_source: SIMULATED' to maintain transparent research ethics.
    """

    def __init__(self):
        # Simulation Mode: normal | warning | extreme
        self.scenario = settings.DEFAULT_SIMULATION_SCENARIO
        
        # Sub-engines
        self.kalman = HydrologicalKalmanFilter()
        self.prediction_engine = HydrologicalPredictionEngine()
        self.monte_carlo = MonteCarloFloodSimulator(settings.DEFAULT_DANGER_THRESHOLD_METERS)
        self.risk_classifier = RiskClassificationEngine()
        self.evacuation_router = DijkstraEvacuationRouter()

        # Baselines
        self.base_rainfall = 5.0
        self.base_water_level = 1.35
        self.base_soil_moisture = 38.0
        
        # Internal state memory
        self.current_rainfall = 5.0
        self.current_water_level = 1.35
        self.current_soil_moisture = 38.0
        self.rate_of_rise = 0.001
        
        self.history_buffer: List[Dict[str, Any]] = []
        self.max_history_len = 60
        self.last_update_time = datetime.utcnow()

        # Multi-station definitions
        self.stations = [
            {
                "id": "SENS-ALAK-01",
                "name": "Alaknanda Basin Upstream Gauge",
                "type": "radar_water_level",
                "lat": 30.155,
                "lon": 78.790,
                "elevation_m": 840,
                "status": "HEALTHY",
                "danger_mark": 3.50
            },
            {
                "id": "SENS-MAND-02",
                "name": "Mandakini Gorge Velocity Radar",
                "type": "surface_velocity_radar",
                "lat": 30.142,
                "lon": 78.805,
                "elevation_m": 810,
                "status": "HEALTHY",
                "danger_mark": 3.40
            },
            {
                "id": "SENS-RDG-03",
                "name": "Chamoli Ridge Cloudburst Tipping Bucket",
                "type": "rain_gauge",
                "lat": 30.165,
                "lon": 78.820,
                "elevation_m": 1250,
                "status": "HEALTHY",
                "danger_mark": 100.0
            },
            {
                "id": "SENS-CONF-04",
                "name": "Rudraprayag Sangam Confluence Probe",
                "type": "ultrasonic_depth",
                "lat": 30.135,
                "lon": 78.815,
                "elevation_m": 760,
                "status": "HEALTHY",
                "danger_mark": 3.60
            },
            {
                "id": "SENS-LOW-05",
                "name": "Mandakini Lowland Valley Soil Probe",
                "type": "soil_moisture",
                "lat": 30.140,
                "lon": 78.798,
                "elevation_m": 800,
                "status": "HEALTHY",
                "danger_mark": 85.0
            }
        ]

    def set_scenario(self, scenario: str):
        """Sets simulation scenario: normal | warning | extreme."""
        sc = scenario.lower()
        if sc not in ("normal", "warning", "extreme", "heavy"):
            raise ValueError(f"Unknown scenario '{scenario}'. Choose normal, warning, or extreme.")
        
        # Map 'heavy' to 'warning'
        if sc == "heavy":
            sc = "warning"
            
        self.scenario = sc
        if sc == "normal":
            self.base_rainfall = 5.0
            self.base_water_level = 1.35
            self.base_soil_moisture = 38.0
        elif sc == "warning":
            self.base_rainfall = 45.0
            self.base_water_level = 2.85
            self.base_soil_moisture = 72.0
        elif sc == "extreme":
            self.base_rainfall = 115.0
            self.base_water_level = 3.82
            self.base_soil_moisture = 95.0

        # Step simulation immediately to update states
        self.step_simulation()

    def reset_simulation(self):
        """Resets telemetry and sub-engine states to baseline."""
        self.scenario = "normal"
        self.base_rainfall = 5.0
        self.base_water_level = 1.35
        self.base_soil_moisture = 38.0
        self.current_rainfall = 5.0
        self.current_water_level = 1.35
        self.current_soil_moisture = 38.0
        self.rate_of_rise = 0.001
        self.kalman.reset(1.35)
        self.history_buffer.clear()

    def step_simulation(self) -> Dict[str, Any]:
        """
        Executes one dynamic simulation time-step:
        1. Injects realistic noise and occasional missing sensor packet.
        2. Filters through Kalman Filter.
        3. Appends reading to telemetry history buffer.
        """
        now = datetime.utcnow()

        # Drift target towards scenario base
        self.current_rainfall += (self.base_rainfall - self.current_rainfall) * 0.15
        self.current_water_level += (self.base_water_level - self.current_water_level) * 0.12
        self.current_soil_moisture += (self.base_soil_moisture - self.current_soil_moisture) * 0.10

        # 1. Add stochastic natural turbulence
        rain_noise = np.random.normal(0.0, 1.2)
        sim_rainfall = max(0.0, self.current_rainfall + rain_noise)
        
        water_noise = np.random.normal(0.0, 0.04)
        sim_raw_water = max(0.3, self.current_water_level + water_noise)
        
        soil_noise = np.random.normal(0.0, 0.8)
        sim_soil = np.clip(self.current_soil_moisture + soil_noise, 5.0, 100.0)

        # 2. Simulate occasional sensor dropout (1 in 50 ticks)
        if random.random() < 0.02:
            input_water_for_kalman = None  # Dropped packet: tests Kalman coasting
            sensor_health = "DEGRADED"
        else:
            input_water_for_kalman = sim_raw_water
            sensor_health = "HEALTHY"

        # 3. Kalman Filter update
        filtered_water, rate_val, uncertainty = self.kalman.update(input_water_for_kalman)
        confidence = self.kalman.get_confidence_score()
        self.rate_of_rise = rate_val

        reading = {
            "timestamp": now.strftime("%H:%M:%S"),
            "full_timestamp": now.isoformat(),
            "sensor_id": "SENS-ALAK-01",
            "station_name": "Alaknanda Basin Upstream Gauge",
            "station_id": "RIVER-GAUGE-01",
            "rainfall": round(float(sim_rainfall), 1),
            "soil_moisture": round(float(sim_soil), 1),
            "water_level": round(float(filtered_water), 2),
            "raw_water_level": round(float(sim_raw_water), 2),
            "rate_of_rise": round(float(rate_val), 4),
            "kalman_variance": round(float(uncertainty), 4),
            "confidence_score": round(float(confidence), 2),
            "sensor_health": sensor_health,
            "status": "active",
            "scenario": self.scenario,
            "is_simulated": True,
            "data_source": "SIMULATED"
        }

        self.history_buffer.append(reading)
        if len(self.history_buffer) > self.max_history_len:
            self.history_buffer.pop(0)

        self.last_update_time = now
        return reading

    def get_live_reading(self) -> Dict[str, Any]:
        """Returns the latest filtered sensor reading, executing a step if needed."""
        if not self.history_buffer:
            return self.step_simulation()
        
        # If last update > 2 seconds ago, step forward
        if (datetime.utcnow() - self.last_update_time).total_seconds() >= 1.8:
            return self.step_simulation()

        return self.history_buffer[-1]

    def get_history(self) -> List[Dict[str, Any]]:
        """Returns historical readings buffer for charting."""
        if not self.history_buffer:
            for _ in range(12):
                self.step_simulation()
        return self.history_buffer

    def get_prediction(self) -> Dict[str, Any]:
        """Calculates 30-minute kinematic and Monte Carlo forecast."""
        live = self.get_live_reading()
        pred = self.prediction_engine.predict_30m(
            current_water_level=live["water_level"],
            rainfall_intensity_mm_hr=live["rainfall"],
            soil_moisture_pct=live["soil_moisture"],
            rate_of_rise_m_min=live["rate_of_rise"]
        )

        mc = self.monte_carlo.run_simulation(
            current_water_level=live["water_level"],
            rainfall_intensity_mm_hr=live["rainfall"],
            soil_moisture_pct=live["soil_moisture"],
            rate_of_rise=live["rate_of_rise"],
            sample_count=settings.DEFAULT_MONTE_CARLO_SAMPLES,
            danger_threshold_m=settings.DEFAULT_DANGER_THRESHOLD_METERS
        )

        # Merge results
        pred["flood_probability"] = mc["flood_probability"]
        pred["monte_carlo_samples"] = mc["monte_carlo_samples"]
        pred["estimated_time_to_breach_min"] = mc["estimated_time_to_breach_min"]
        pred["danger_threshold"] = settings.DEFAULT_DANGER_THRESHOLD_METERS
        
        # Risk level determination
        risk_res = self.risk_classifier.classify_risk(
            flood_probability=mc["flood_probability"],
            water_level=live["water_level"],
            danger_threshold_m=settings.DEFAULT_DANGER_THRESHOLD_METERS
        )
        pred["risk_level"] = risk_res["risk_level"]

        return pred

    def get_risk(self) -> Dict[str, Any]:
        """Returns stateful risk assessment with hysteresis."""
        pred = self.get_prediction()
        live = self.get_live_reading()

        risk_res = self.risk_classifier.classify_risk(
            flood_probability=pred["flood_probability"],
            water_level=live["water_level"],
            danger_threshold_m=settings.DEFAULT_DANGER_THRESHOLD_METERS
        )

        risk_res["current_water_level"] = live["water_level"]
        risk_res["predicted_water_level_30m"] = pred["predicted_water_level"]
        risk_res["confidence_interval"] = pred["confidence_interval"]

        # Check if automated alert should be dispatched
        if alert_service.should_trigger_alert(risk_res["risk_level"]):
            alert_service.dispatch_alert(
                risk_level=risk_res["risk_level"],
                affected_location=risk_res["affected_location"],
                flood_probability=risk_res["flood_probability"],
                recommended_action=risk_res["recommended_action"]
            )

        return risk_res

    def get_evacuation_route(
        self,
        origin_lat: Optional[float] = None,
        origin_lon: Optional[float] = None,
        shelter_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculates dynamic Dijkstra safe route."""
        live = self.get_live_reading()
        risk_res = self.get_risk()

        return self.evacuation_router.calculate_safe_evacuation_route(
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            destination_shelter_id=shelter_id,
            current_water_level=live["water_level"],
            risk_level=risk_res["risk_level"]
        )

    def get_all_stations(self) -> List[Dict[str, Any]]:
        """Returns list of all monitored geographical sensor stations."""
        live = self.get_live_reading()
        result = []
        for s in self.stations:
            station_copy = dict(s)
            station_copy["is_simulated"] = True
            station_copy["data_source"] = "SIMULATED"
            station_copy["last_reading"] = {
                "water_level": live["water_level"] if "water" in s["type"] or "velocity" in s["type"] else 0.0,
                "rainfall": live["rainfall"],
                "soil_moisture": live["soil_moisture"],
                "timestamp": live["timestamp"]
            }
            result.append(station_copy)
        return result

# Global singleton simulation service
simulation_service = EnvironmentalSensorSimulator()
