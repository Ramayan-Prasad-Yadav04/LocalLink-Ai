import numpy as np
from typing import List, Dict, Any, Tuple
from .hydrology_model import RainfallRunoffHydrologyModel

class MonteCarloSimulator:
    """
    Monte-Carlo Hydrological Ensemble Simulator.
    Simulates 200 stochastic scenarios accounting for:
    - Rainfall intensity spatial-temporal variance
    - Mountain soil saturation uncertainty
    - Catchment infiltration decay
    - Channel hydraulic roughness perturbations
    """
    def __init__(self, num_scenarios: int = 200, horizon_minutes: int = 30):
        self.num_scenarios = num_scenarios
        self.horizon_minutes = horizon_minutes
        self.hydrology_model = RainfallRunoffHydrologyModel()

    def run_simulation(self, 
                       current_water_level: float, 
                       rainfall_rate: float, 
                       soil_moisture: float, 
                       rate_of_rise: float) -> Dict[str, Any]:
        """
        Runs 200 stochastic simulation paths over the 30-minute horizon.
        
        Returns:
            - mean_trajectory (30 minutes)
            - ci_lower_95 (30 minutes)
            - ci_upper_95 (30 minutes)
            - uncertainty_std (30 minutes)
            - all_scenarios_matrix: shape (num_scenarios, 30)
            - final_mean_water_level
            - final_ci: (lower, upper)
        """
        # Set deterministic seed base for stability while still providing realistic stochastic variance
        np.random.seed(int(abs(current_water_level * 1000 + rainfall_rate * 10) % 10000))
        
        scenarios = np.zeros((self.num_scenarios, self.horizon_minutes))
        
        # Perturbation distributions
        # Rainfall variance (log-normal / normal with 15% standard deviation)
        rain_perturbations = np.random.normal(loc=1.0, scale=0.18, size=self.num_scenarios)
        # Soil moisture variance (+- 5%)
        soil_perturbations = np.random.normal(loc=0.0, scale=4.0, size=self.num_scenarios)
        # Hydrological parameter variance (channel geometry / roughness +- 10%)
        roughness_perturbations = np.random.normal(loc=1.0, scale=0.10, size=self.num_scenarios)
        
        for i in range(self.num_scenarios):
            sim_rain = max(0.0, rainfall_rate * rain_perturbations[i])
            sim_soil = np.clip(soil_moisture + soil_perturbations[i], 5.0, 99.0)
            
            # Temporary hydrology model with perturbed parameters
            perturbed_model = RainfallRunoffHydrologyModel(
                catchment_area_sqkm=4.2 * roughness_perturbations[i],
                discharge_coeff=8.5 / max(0.7, roughness_perturbations[i])
            )
            
            traj = perturbed_model.predict_deterministic_trajectory(
                current_water_level=current_water_level,
                rainfall_rate_mmh=sim_rain,
                soil_moisture=sim_soil,
                rate_of_rise=rate_of_rise,
                horizon_minutes=self.horizon_minutes
            )
            scenarios[i, :] = traj

        # Statistical analysis across the 200 scenarios at each time step
        mean_trajectory = np.mean(scenarios, axis=0)
        std_trajectory = np.std(scenarios, axis=0)
        
        # 95% Confidence Interval (2.5th and 97.5th percentiles)
        ci_lower = np.percentile(scenarios, 2.5, axis=0)
        ci_upper = np.percentile(scenarios, 97.5, axis=0)
        
        # Build time series points for frontend Recharts
        time_series = []
        for m in range(self.horizon_minutes):
            time_series.append({
                "minute": m + 1,
                "mean_water_level": round(float(mean_trajectory[m]), 2),
                "ci_lower": round(float(ci_lower[m]), 2),
                "ci_upper": round(float(ci_upper[m]), 2),
                "danger_threshold": 3.5
            })

        final_mean = float(mean_trajectory[-1])
        final_ci_low = float(ci_lower[-1])
        final_ci_up = float(ci_upper[-1])
        
        return {
            "num_scenarios": self.num_scenarios,
            "horizon_minutes": self.horizon_minutes,
            "time_series": time_series,
            "mean_water_level": round(final_mean, 2),
            "ci_lower": round(final_ci_low, 2),
            "ci_upper": round(final_ci_up, 2),
            "scenarios_matrix": scenarios
        }
