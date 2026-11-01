from datetime import datetime
from typing import Dict, Any, Tuple

class RiskEngineWithHysteresis:
    """
    Intelligent Flash Flood Risk Classification Engine with Stateful Hysteresis.
    
    Levels:
    - LOW: Normal conditions. Probability < 18%, Predicted Level < 2.4m
    - MODERATE: Increasing risk. Probability 18-45%, Predicted Level 2.4-3.0m
    - HIGH: Severe warning. Probability 45-75%, Predicted Level 3.0-3.5m
    - CRITICAL: Imminent flash flood breach. Probability >= 75% or Predicted >= 3.5m
    
    Hysteresis Logic:
    - Escalation: Instantaneous transition to safeguard life and limb.
    - De-escalation: Requires a deadband safety margin and sustainment over N consecutive cycles
      to prevent rapid flickering / chattering between risk states.
    """
    
    LEVEL_ORDER = {"LOW": 0, "MODERATE": 1, "HIGH": 2, "CRITICAL": 3}
    REV_LEVEL = {0: "LOW", 1: "MODERATE", 2: "HIGH", 3: "CRITICAL"}
    
    COLORS = {
        "LOW": "#10B981",       # Emerald Green
        "MODERATE": "#F59E0B",  # Amber Yellow
        "HIGH": "#F97316",      # Bright Orange
        "CRITICAL": "#EF4444"   # Emergency Red
    }
    
    MESSAGES = {
        "LOW": {
            "title": "Situation Normal",
            "message": "Situation normal. River discharge and soil saturation within baseline capacity. Continue monitoring.",
            "action": "Routine hydrometric observation active. No public action needed."
        },
        "MODERATE": {
            "title": "Elevated Hydrological Risk",
            "message": "Flood risk increasing. Catchment runoff rate accelerating and soil moisture elevated. Stay alert.",
            "action": "Alert SDRF / NDRF quick response units. Pre-position high-ground relief assets."
        },
        "HIGH": {
            "title": "Severe Flash Flood Warning",
            "message": "High flood risk. Water levels approaching critical 3.5m danger threshold within 30 minutes. Prepare for evacuation.",
            "action": "Initiate Stage-1 evacuation advisory. Clear riverside promenades and flood-prone riverbank hamlets."
        },
        "CRITICAL": {
            "title": "EMERGENCY: Immediate Flash Flood Inundation",
            "message": "Critical flood risk. River breach imminent. Evacuate using the recommended safe route.",
            "action": "SOUND EMERGENCY SIRENS. Execute immediate mandatory evacuation towards designated high-ground shelters."
        }
    }

    def __init__(self, required_downgrade_cycles: int = 3, buffer_prob: float = 5.0, buffer_level: float = 0.15):
        self.current_risk_level = "LOW"
        self.candidate_lower_level = None
        self.consecutive_lower_cycles = 0
        self.required_downgrade_cycles = required_downgrade_cycles
        self.buffer_prob = buffer_prob
        self.buffer_level = buffer_level
        self.last_evaluated = datetime.now().isoformat()

    def classify_raw(self, flood_prob: float, predicted_water_level: float) -> str:
        """Determines instantaneous risk based on thresholds."""
        if flood_prob >= 75.0 or predicted_water_level >= 3.5:
            return "CRITICAL"
        elif flood_prob >= 45.0 or predicted_water_level >= 3.0:
            return "HIGH"
        elif flood_prob >= 18.0 or predicted_water_level >= 2.4:
            return "MODERATE"
        else:
            return "LOW"

    def evaluate(self, flood_prob: float, current_water_level: float, predicted_water_level: float, ci_lower: float, ci_upper: float) -> Dict[str, Any]:
        """
        Evaluates risk incorporating hysteresis memory.
        """
        raw_level = self.classify_raw(flood_prob, predicted_water_level)
        current_idx = self.LEVEL_ORDER[self.current_risk_level]
        raw_idx = self.LEVEL_ORDER[raw_level]
        
        hysteresis_active = False

        if raw_idx > current_idx:
            # Immediate escalation to protect life
            self.current_risk_level = raw_level
            self.candidate_lower_level = None
            self.consecutive_lower_cycles = 0
        elif raw_idx < current_idx:
            # Downgrade requested: check hysteresis conditions
            hysteresis_active = True
            
            # Check deadband buffer
            safe_to_downgrade = False
            if self.current_risk_level == "CRITICAL":
                safe_to_downgrade = (flood_prob < (75.0 - self.buffer_prob)) and (predicted_water_level < (3.5 - self.buffer_level))
            elif self.current_risk_level == "HIGH":
                safe_to_downgrade = (flood_prob < (45.0 - self.buffer_prob)) and (predicted_water_level < (3.0 - self.buffer_level))
            elif self.current_risk_level == "MODERATE":
                safe_to_downgrade = (flood_prob < (18.0 - self.buffer_prob)) and (predicted_water_level < (2.4 - self.buffer_level))
            
            if safe_to_downgrade:
                if self.candidate_lower_level == raw_level:
                    self.consecutive_lower_cycles += 1
                else:
                    self.candidate_lower_level = raw_level
                    self.consecutive_lower_cycles = 1
                
                if self.consecutive_lower_cycles >= self.required_downgrade_cycles:
                    self.current_risk_level = raw_level
                    self.candidate_lower_level = None
                    self.consecutive_lower_cycles = 0
                    hysteresis_active = False
            else:
                self.consecutive_lower_cycles = 0
                self.candidate_lower_level = None
        else:
            # Stable at current level
            self.candidate_lower_level = None
            self.consecutive_lower_cycles = 0

        self.last_evaluated = datetime.now().isoformat()
        
        # Build diagnostic explanation
        explanation = self._build_explanation(
            self.current_risk_level, 
            flood_prob, 
            current_water_level, 
            predicted_water_level, 
            ci_lower, 
            ci_upper
        )
        
        meta = self.MESSAGES[self.current_risk_level]

        return {
            "risk_level": self.current_risk_level,
            "raw_risk_level": raw_level,
            "flood_probability": round(flood_prob, 1),
            "current_water_level": round(current_water_level, 2),
            "predicted_water_level_30m": round(predicted_water_level, 2),
            "confidence_interval": {
                "lower": round(ci_lower, 2),
                "upper": round(ci_upper, 2)
            },
            "explanation": explanation,
            "recommended_action": meta["action"],
            "title": meta["title"],
            "standard_message": meta["message"],
            "color_code": self.COLORS[self.current_risk_level],
            "hysteresis_active": hysteresis_active,
            "cycles_at_current_level": self.consecutive_lower_cycles,
            "last_evaluated": self.last_evaluated
        }

    def _build_explanation(self, risk: str, prob: float, curr_lvl: float, pred_lvl: float, ci_low: float, ci_up: float) -> str:
        diff = pred_lvl - curr_lvl
        surge_dir = "surging by" if diff > 0 else "receding by"
        
        if risk == "CRITICAL":
            return (f"CRITICAL BREACH WARNING: Water level is projected to breach the 3.50m threshold "
                    f"reaching {pred_lvl:.2f}m (95% CI: [{ci_low:.2f}m, {ci_up:.2f}m]), {surge_dir} {abs(diff):.2f}m. "
                    f"Monte-Carlo ensemble indicates an acute {prob:.1f}% flood probability across 200 catch-basin scenarios.")
        elif risk == "HIGH":
            return (f"HIGH FLOOD RISK: Gauge measurements show water level advancing to {pred_lvl:.2f}m "
                    f"(95% CI: [{ci_low:.2f}m, {ci_up:.2f}m]). Infiltration capacity is heavily saturated with "
                    f"{prob:.1f}% probability of exceeding channel capacity within 30 minutes.")
        elif risk == "MODERATE":
            return (f"MODERATE ADVISORY: Catchment runoff accumulation is elevated. Predicted 30-min level "
                    f"is {pred_lvl:.2f}m (95% CI: [{ci_low:.2f}m, {ci_up:.2f}m]) with {prob:.1f}% flood probability. "
                    f"River stream velocity is accelerating.")
        else:
            return (f"NORMAL BASELINE: River hydraulics are stable at {curr_lvl:.2f}m (forecast: {pred_lvl:.2f}m). "
                    f"Infiltration absorption remains sufficient. Flood probability is low at {prob:.1f}%.")

    def reset(self):
        self.current_risk_level = "LOW"
        self.candidate_lower_level = None
        self.consecutive_lower_cycles = 0
