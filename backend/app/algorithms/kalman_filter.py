import numpy as np
from typing import Tuple

class WaterLevelKalmanFilter:
    """
    State-Space Kalman Filter for Water Level Sensor Fusion.
    State vector x = [h, v]^T
    h: water level in meters
    v: rate of water level change (m/min)
    
    Addresses real-world environmental sensor noise (ultrasonic water level bounce, 
    turbulent mountain flow, splashing, and acoustic interference).
    """
    def __init__(self, dt: float = 2.0 / 60.0, process_var: float = 0.002, measure_var: float = 0.04):
        # Time step in minutes (2 seconds = 2/60 minutes)
        self.dt = dt
        
        # State estimate: [water_level, rate_of_rise]
        self.x = np.array([1.2, 0.0], dtype=float)
        
        # State transition matrix F
        self.F = np.array([
            [1.0, self.dt],
            [0.0, 1.0]
        ], dtype=float)
        
        # Measurement matrix H (only observing water level directly)
        self.H = np.array([[1.0, 0.0]], dtype=float)
        
        # Covariance matrix P
        self.P = np.array([
            [0.1, 0.0],
            [0.0, 0.01]
        ], dtype=float)
        
        # Process noise covariance Q (accounting for rapid mountain runoff dynamics)
        self.Q = np.array([
            [(self.dt**4)/4 * process_var, (self.dt**3)/2 * process_var],
            [(self.dt**3)/2 * process_var, (self.dt**2) * process_var]
        ], dtype=float)
        
        # Measurement noise covariance R (sensor acoustic noise)
        self.R = np.array([[measure_var]], dtype=float)
        
        self.last_raw = 1.2
        self.innovation = 0.0

    def update(self, raw_measurement: float) -> Tuple[float, float]:
        """
        Runs Predict and Update steps of the Kalman Filter.
        Returns:
            (filtered_water_level, rate_of_rise_m_per_min)
        """
        self.last_raw = raw_measurement
        
        # 1. Prediction Step
        x_pred = self.F @ self.x
        P_pred = self.F @ self.P @ self.F.T + self.Q
        
        # 2. Measurement Residual (Innovation)
        z = np.array([[raw_measurement]], dtype=float)
        y = z - self.H @ x_pred
        self.innovation = float(y[0, 0])
        
        # 3. Innovation Covariance
        S = self.H @ P_pred @ self.H.T + self.R
        
        # 4. Kalman Gain
        K = P_pred @ self.H.T @ np.linalg.inv(S)
        
        # 5. State Update
        self.x = x_pred + (K @ y).flatten()
        
        # 6. Covariance Update
        I = np.eye(2)
        self.P = (I - K @ self.H) @ P_pred
        
        filtered_level = float(self.x[0])
        rate_of_rise = float(self.x[1])
        
        # Water level cannot be physically negative
        filtered_level = max(0.1, filtered_level)
        
        return round(filtered_level, 3), round(rate_of_rise, 4)

    def reset(self, initial_level: float = 1.2):
        self.x = np.array([initial_level, 0.0], dtype=float)
        self.P = np.array([[0.1, 0.0], [0.0, 0.01]], dtype=float)


class ScalarKalmanFilter:
    """Lightweight 1D Kalman filter for rainfall and soil moisture smoothing."""
    def __init__(self, initial_val: float, q: float = 0.01, r: float = 0.1):
        self.x = initial_val
        self.p = 1.0
        self.q = q
        self.r = r

    def update(self, measurement: float) -> float:
        # Prediction
        p_pred = self.p + self.q
        # Kalman Gain
        k = p_pred / (p_pred + self.r)
        # Update
        self.x = self.x + k * (measurement - self.x)
        self.p = (1 - k) * p_pred
        return float(self.x)
