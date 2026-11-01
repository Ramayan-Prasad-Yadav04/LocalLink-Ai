from typing import Dict, Any
from datetime import datetime
from ..config import settings

class RiskClassificationEngine:
    """
    Configurable risk classification service with hysteresis stability filter.
    
    Demonstration Thresholds:
      - LOW: 0–20%
      - MODERATE: Above 20–40%
      - HIGH: Above 40–70%
      - CRITICAL: Above 70–100%
      
    Hysteresis logic:
      A downgrade in warning level requires flood probability to fall at least 5% below
      the threshold, preventing alarm chatter during peak surges.
    """

    def __init__(
        self,
        low_max: float = 20.0,
        moderate_max: float = 40.0,
        high_max: float = 70.0,
        hysteresis_buffer_pct: float = 5.0
    ):
        self.low_max = low_max
        self.mod_max = moderate_max
        self.high_max = high_max
        self.hysteresis_buffer = hysteresis_buffer_pct
        self.current_risk_level = "LOW"

    def classify_risk(
        self,
        flood_probability: float,
        water_level: float,
        danger_threshold_m: float = 3.50,
        location_name: str = "Mandakini Lower Valley Settlement"
    ) -> Dict[str, Any]:
        """
        Evaluates risk category using stateful hysteresis dampening.
        """
        prob = float(flood_probability)
        previous_level = self.current_risk_level
        raw_level = "LOW"

        # 1. Raw Level Determination
        if prob > self.high_max or water_level >= danger_threshold_m:
            raw_level = "CRITICAL"
        elif prob > self.mod_max or water_level >= (danger_threshold_m - 0.40):
            raw_level = "HIGH"
        elif prob > self.low_max or water_level >= (danger_threshold_m - 0.90):
            raw_level = "MODERATE"
        else:
            raw_level = "LOW"

        # 2. Hysteresis Dampening
        # Escalations happen immediately; de-escalations require crossing the hysteresis buffer
        hysteresis_active = False

        if previous_level == "CRITICAL":
            if prob < (self.high_max - self.hysteresis_buffer) and water_level < (danger_threshold_m - 0.20):
                new_level = raw_level
            else:
                new_level = "CRITICAL"
                if raw_level != "CRITICAL":
                    hysteresis_active = True
        elif previous_level == "HIGH":
            if raw_level == "CRITICAL":
                new_level = "CRITICAL"
            elif prob < (self.mod_max - self.hysteresis_buffer):
                new_level = raw_level
            else:
                new_level = "HIGH"
                if raw_level == "MODERATE" or raw_level == "LOW":
                    hysteresis_active = True
        elif previous_level == "MODERATE":
            if raw_level in ("CRITICAL", "HIGH"):
                new_level = raw_level
            elif prob < (self.low_max - self.hysteresis_buffer):
                new_level = "LOW"
            else:
                new_level = "MODERATE"
        else:
            new_level = raw_level

        self.current_risk_level = new_level

        # 3. Actionable Safety Directives
        metadata = self._get_risk_metadata(new_level, prob, water_level, danger_threshold_m)

        return {
            "location_id": "ALAKNANDA-MANDAKINI-VALLEY",
            "affected_location": location_name,
            "risk_level": new_level,
            "raw_risk_level": raw_level,
            "flood_probability": round(prob, 1),
            "danger_threshold_m": danger_threshold_m,
            "explanation": metadata["explanation"],
            "recommended_action": metadata["action"],
            "color_code": metadata["color"],
            "hysteresis_active": hysteresis_active,
            "timestamp": datetime.utcnow().isoformat(),
            "is_simulated": True
        }

    def _get_risk_metadata(self, level: str, prob: float, water_level: float, threshold: float) -> Dict[str, str]:
        if level == "CRITICAL":
            return {
                "color": "#EF4444",
                "explanation": f"EXTREME FLOOD BREACH: Probability is {prob}% with stream level at {water_level:.2f}m exceeding danger threshold ({threshold:.2f}m). Gorge inundation occurring.",
                "action": "MANDATORY EVACUATION: Evacuate valley floor immediately. Follow Dijkstra safe evacuation path to Pine Ridge High Ground Shelter. Avoid all bridges."
            }
        elif level == "HIGH":
            return {
                "color": "#F97316",
                "explanation": f"HIGH FLOOD WARNING: Probability is {prob}%. Rapid rate of rise detected in upstream tributaries. Road submergence expected within 30 minutes.",
                "action": "PREPARE TO EVACUATE: Move livestock and vehicles to high ground. Stand by for SDRF convoy evacuation order. Charge emergency transceivers."
            }
        elif level == "MODERATE":
            return {
                "color": "#F59E0B",
                "explanation": f"MODERATE FLOOD ADVISORY: Probability is {prob}%. Mountain rainfall is active and topsoil saturation is increasing rapidly.",
                "action": "CAUTION ADVISED: Stay clear of riverbanks, ghats, and ravine drainage culverts. Monitor FloodWatch AI real-time telemetry."
            }
        else:
            return {
                "color": "#10B981",
                "explanation": f"NORMAL BASELINE: Probability is {prob}%. River discharge and catchment runoff operating within standard seasonal bounds.",
                "action": "ROUTINE MONITORING: Normal hydrometric observation active. Safe shelters and telemetry stations fully operational."
            }
