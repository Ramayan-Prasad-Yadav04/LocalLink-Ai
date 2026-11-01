import numpy as np
from typing import Dict, Any, Optional

class FloodProbabilityCalculator:
    """
    Evaluates flood probability based on Monte-Carlo ensemble simulations
    and danger threshold exceedance.
    
    Danger Threshold = 3.5 meters
    """
    def __init__(self, danger_threshold: float = 3.5):
        self.danger_threshold = danger_threshold

    def calculate_probability(self, scenarios_matrix: np.ndarray) -> Dict[str, Any]:
        """
        scenarios_matrix: shape (200, 30)
        Returns:
            - flood_probability_percent: 0.0 to 100.0%
            - time_to_breach_min: earliest minute where probability > 50% or mean crosses 3.5m
            - peak_probability_at_30m
        """
        num_scenarios, horizon = scenarios_matrix.shape
        
        # Check how many scenarios exceed 3.5m at any point in the 30-minute window
        breaches_anytime = np.any(scenarios_matrix >= self.danger_threshold, axis=1)
        breached_count = np.sum(breaches_anytime)
        flood_prob = (breached_count / num_scenarios) * 100.0
        
        # Check time to breach (first minute where >= 30% of scenarios or mean crosses threshold)
        time_to_breach: Optional[int] = None
        for m in range(horizon):
            minute_vals = scenarios_matrix[:, m]
            if np.mean(minute_vals) >= self.danger_threshold or (np.sum(minute_vals >= self.danger_threshold) / num_scenarios) >= 0.40:
                time_to_breach = m + 1
                break
                
        # Probability at exactly 30 minutes
        prob_at_30m = (np.sum(scenarios_matrix[:, -1] >= self.danger_threshold) / num_scenarios) * 100.0
        
        return {
            "flood_probability": round(float(flood_prob), 1),
            "prob_at_30m": round(float(prob_at_30m), 1),
            "danger_threshold": self.danger_threshold,
            "estimated_time_to_breach_min": time_to_breach,
            "scenarios_breached": int(breached_count),
            "total_scenarios": num_scenarios
        }
