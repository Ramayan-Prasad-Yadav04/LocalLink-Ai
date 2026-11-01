import numpy as np
from typing import Optional, Dict, Any, Tuple

class HydrologicalKalmanFilter:
    """
    1D Discrete Kalman Filter for sensor fusion and noise attenuation on hydrometric river telemetry.
    
    State Vector x = [h, v]^T:
      - h: Estimated true water level (meters)
      - v: Estimated rate of rise dh/dt (meters/minute)
      
    State Transition:
      x_k = F * x_{k-1} + w_{k-1},  where F = [[1, dt], [0, 1]]
      Process Noise Covariance Q
      
    Measurement:
      z_k = H * x_k + v_k,  where H = [[1, 0]]
      Measurement Noise Covariance R
    """

    def __init__(
        self,
        dt: float = 0.5,                  # 30-second time interval between step ticks
        process_noise_std: float = 0.008,  # Process standard deviation (physical fluctuations)
        measurement_noise_std: float = 0.12 # Sensor noise standard deviation (wave turbulence)
    ):
        self.dt = dt
        
        # State vector [water_level, rate_of_rise]
        self.x = np.array([1.35, 0.0], dtype=float)
        
        # State transition matrix F
        self.F = np.array([
            [1.0, self.dt],
            [0.0, 1.0]
        ], dtype=float)
        
        # Measurement matrix H
        self.H = np.array([[1.0, 0.0]], dtype=float)
        
        # Error covariance matrix P
        self.P = np.array([
            [0.1, 0.0],
            [0.0, 0.05]
        ], dtype=float)
        
        # Process noise covariance Q
        q_var = process_noise_std ** 2
        self.Q = np.array([
            [0.25 * (self.dt ** 4) * q_var, 0.5 * (self.dt ** 3) * q_var],
            [0.5 * (self.dt ** 3) * q_var, (self.dt ** 2) * q_var]
        ], dtype=float)
        
        # Measurement noise covariance R
        self.R = np.array([[measurement_noise_std ** 2]], dtype=float)
        
        self.last_raw: Optional[float] = None
        self.innovation: float = 0.0
        self.step_count: int = 0

    def predict(self) -> np.ndarray:
        """Prediction Step: Project state and covariance forward in time."""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        return self.x

    def update(self, raw_measurement: Optional[float]) -> Tuple[float, float, float]:
        """
        Measurement Update Step:
        - If raw_measurement is provided, update state with Kalman Gain.
        - If raw_measurement is None (missing sensor packet), coast using prediction.
        
        Returns:
          (filtered_water_level, rate_of_rise, estimated_variance)
        """
        self.step_count += 1
        
        # 1. Predict
        self.predict()
        
        # 2. Check for missing or corrupted reading
        if raw_measurement is None or np.isnan(raw_measurement) or raw_measurement < 0.0:
            # Missing sensor packet: rely on physical kinematic prediction
            filtered_val = float(self.x[0])
            rate_val = float(self.x[1])
            uncertainty = float(self.P[0, 0])
            return filtered_val, rate_val, uncertainty

        self.last_raw = raw_measurement
        z = np.array([[raw_measurement]], dtype=float)
        
        # Innovation (measurement residual)
        y = z - (self.H @ self.x)
        self.innovation = float(y[0, 0])
        
        # Innovation covariance
        S = self.H @ self.P @ self.H.T + self.R
        
        # Kalman Gain
        K = self.P @ self.H.T @ np.linalg.inv(S)
        
        # State Update
        self.x = self.x + (K @ y).flatten()
        
        # Covariance Update (Joseph form for numerical symmetry)
        I = np.eye(2)
        I_KH = I - (K @ self.H)
        self.P = I_KH @ self.P @ I_KH.T + (K @ self.R @ K.T)
        
        filtered_val = float(self.x[0])
        rate_val = float(self.x[1])
        uncertainty = float(self.P[0, 0])
        
        return filtered_val, rate_val, uncertainty

    def get_confidence_score(self) -> float:
        """Computes a 0.0 to 1.0 confidence score based on sensor innovation variance."""
        var = float(self.P[0, 0])
        # Low variance => high confidence (0.95+), high variance => lower confidence
        score = np.exp(-2.5 * var)
        return float(np.clip(score, 0.40, 0.99))

    def reset(self, initial_water_level: float = 1.35):
        """Resets the Kalman filter state to baseline nominal parameters."""
        self.x = np.array([initial_water_level, 0.0], dtype=float)
        self.P = np.array([[0.1, 0.0], [0.0, 0.05]], dtype=float)
        self.last_raw = initial_water_level
        self.innovation = 0.0
        self.step_count = 0
