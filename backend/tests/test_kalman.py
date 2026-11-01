import pytest
import numpy as np
from app.services.kalman_filter import HydrologicalKalmanFilter

def test_kalman_filter_initialization():
    kf = HydrologicalKalmanFilter(dt=0.5)
    assert kf.x[0] == 1.35
    assert kf.x[1] == 0.0
    assert kf.P.shape == (2, 2)
    assert kf.step_count == 0

def test_kalman_filter_noise_reduction():
    kf = HydrologicalKalmanFilter(dt=0.5, measurement_noise_std=0.15)
    
    # Inject noisy readings around 2.0m true value
    noisy_measurements = [2.0 + np.random.normal(0, 0.25) for _ in range(25)]
    filtered_results = []
    
    for val in noisy_measurements:
        filtered_val, rate, var = kf.update(val)
        filtered_results.append(filtered_val)
        
    # The variance of the filtered series must be lower than the raw noisy series
    raw_var = np.var(noisy_measurements[5:])
    filtered_var = np.var(filtered_results[5:])
    assert filtered_var <= raw_var

def test_kalman_filter_missing_sensor_reading():
    kf = HydrologicalKalmanFilter(dt=0.5)
    kf.update(1.40)
    kf.update(1.42)
    
    # Simulate missing reading packet (None)
    filtered_val, rate, uncertainty = kf.update(None)
    assert filtered_val is not None
    assert not np.isnan(filtered_val)
    # Filter should coast using kinematic prediction
    assert filtered_val >= 1.40

def test_kalman_confidence_score():
    kf = HydrologicalKalmanFilter()
    score = kf.get_confidence_score()
    assert 0.40 <= score <= 0.99
