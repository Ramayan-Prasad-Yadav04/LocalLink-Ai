import numpy as np
from typing import List, Dict, Any

class RainfallRunoffHydrologyModel:
    """
    Physical-hydrological rainfall-runoff model tailored for steep hilly river catchments.
    
    Principles:
    1. Soil Moisture Infiltration Deficit: High soil moisture drastically reduces infiltration,
       leading to immediate overland runoff (SCS-CN inspired formulation).
    2. Catchment Kinematics & Lag: Water takes time to drain into the main mountain gorge.
    3. Non-linear Hydraulic Channel Routing: Outflow depends on stage height (Manning's open channel flow).
    """
    def __init__(self, 
                 catchment_area_sqkm: float = 4.2,
                 baseflow_m3s: float = 4.0,
                 channel_width_m: float = 18.0,
                 discharge_coeff: float = 8.5):
        self.catchment_area = catchment_area_sqkm # sq km
        self.baseflow = baseflow_m3s # m^3/s
        self.channel_width = channel_width_m # meters
        self.discharge_coeff = discharge_coeff # hydraulic rating curve coefficient

    def calculate_runoff_coefficient(self, soil_moisture_percent: float) -> float:
        """
        Calculates dynamic runoff coefficient C (0.1 to 0.95) based on soil moisture saturation.
        When soil moisture exceeds 70%, ground saturation causes rapid surface runoff surges.
        """
        sat_ratio = np.clip(soil_moisture_percent / 100.0, 0.05, 1.0)
        # S-curve / sigmoid saturation response
        c_base = 0.12
        c_saturated = 0.92
        c = c_base + (c_saturated - c_base) / (1.0 + np.exp(-10.0 * (sat_ratio - 0.65)))
        return float(np.clip(c, 0.10, 0.96))

    def predict_deterministic_trajectory(self, 
                                        current_water_level: float, 
                                        rainfall_rate_mmh: float, 
                                        soil_moisture: float, 
                                        rate_of_rise: float = 0.0,
                                        horizon_minutes: int = 30) -> List[float]:
        """
        Generates a 30-minute deterministic water level trajectory at 1-minute intervals.
        """
        c_runoff = self.calculate_runoff_coefficient(soil_moisture)
        
        # Effective rainfall intensity in mm/min
        eff_rain_mm_min = (rainfall_rate_mmh / 60.0) * c_runoff
        
        # Inflow discharge Q_in = C * A * P_eff
        # Area in m^2 = catchment_area * 1e6. Depth in m = eff_rain_mm_min / 1000
        # Q_in in m^3/s = (A * depth) / 60
        q_inflow_peak = (self.catchment_area * 1e6 * (eff_rain_mm_min / 1000.0)) / 60.0 + self.baseflow
        
        levels = []
        h = current_water_level
        dt_sec = 60.0 # 1 minute time step
        
        for t in range(1, horizon_minutes + 1):
            # Kinematic wave lag: inflow ramps up based on catchment concentration time (~8-12 mins)
            ramp = 1.0 - np.exp(-t / 8.0)
            q_in = self.baseflow + (q_inflow_peak - self.baseflow) * ramp
            
            # Channel outflow according to hydraulic stage-discharge rating: Q_out = k * h^1.5
            q_out = self.discharge_coeff * (max(0.1, h) ** 1.5)
            
            # Net storage change in channel: dh/dt = (Q_in - Q_out) / surface_area
            channel_reach_area = self.channel_width * 1500.0 # effective upstream reach surface area
            dh_dt = (q_in - q_out) / channel_reach_area # in m/s
            
            # Forward Euler step with rate-of-rise inertia
            inertia_factor = np.exp(-t / 15.0)
            h = h + (dh_dt * dt_sec) + (rate_of_rise * dt_sec / 60.0) * inertia_factor
            
            # Ensure physical bounds
            h = max(0.2, h)
            levels.append(round(float(h), 3))
            
        return levels
