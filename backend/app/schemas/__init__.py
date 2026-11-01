from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- SENSOR SCHEMAS ---
class SensorReadingBase(BaseModel):
    sensor_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    raw_water_level: Optional[float] = None
    raw_rainfall: Optional[float] = None
    raw_soil_moisture: Optional[float] = None
    filtered_water_level: Optional[float] = None
    filtered_rainfall: Optional[float] = None
    filtered_soil_moisture: Optional[float] = None
    rate_of_rise: float = 0.0
    kalman_variance: float = 0.01
    confidence_score: float = 0.95
    is_simulated: bool = True
    data_source: str = "SIMULATED"

class SensorReadingResponse(SensorReadingBase):
    id: Optional[int] = None
    water_level: Optional[float] = None  # Friendly alias for frontend
    rainfall: Optional[float] = None
    soil_moisture: Optional[float] = None
    station_name: Optional[str] = None

    class Config:
        from_attributes = True

class SensorBase(BaseModel):
    id: str
    name: str
    sensor_type: str
    latitude: float
    longitude: float
    elevation_m: float
    basin_name: str = "Alaknanda Basin"
    status: str = "HEALTHY"
    danger_mark_m: float = 3.50
    warning_mark_m: float = 2.80
    battery_pct: float = 95.0
    signal_rssi: int = -68
    is_simulated: bool = True

class SensorCreate(SensorBase):
    pass

class SensorResponse(SensorBase):
    created_at: datetime
    last_reading: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class SensorSimulateRequest(BaseModel):
    scenario: str = "normal"  # normal | warning | extreme
    sensor_id: Optional[str] = None
    custom_rainfall: Optional[float] = None
    custom_water_level: Optional[float] = None
    custom_soil_moisture: Optional[float] = None

# --- PREDICTION SCHEMAS ---
class TimeSeriesForecastPoint(BaseModel):
    minute: int
    mean_water_level: float
    ci_lower: float
    ci_upper: float
    percentile_25: Optional[float] = None
    percentile_75: Optional[float] = None

class PredictionResponse(BaseModel):
    prediction_lead_minutes: int = 30
    current_water_level: float
    predicted_water_level: float
    predicted_change: float
    mean_water_level: float  # alias
    ci_lower_95: float
    ci_upper_95: float
    confidence_interval: Dict[str, float]
    flood_probability: float
    danger_threshold: float = 3.50
    risk_level: str
    estimated_time_to_breach_min: Optional[int] = None
    monte_carlo_samples: int = 1000
    model_version: str = "Kinematic-Wave-MC-v2"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_simulated: bool = True
    time_series: List[TimeSeriesForecastPoint] = []

class PredictionRunRequest(BaseModel):
    current_water_level: Optional[float] = None
    rainfall_rate: Optional[float] = None
    soil_moisture: Optional[float] = None
    monte_carlo_samples: int = 1000
    danger_threshold_m: float = 3.50
    lead_minutes: int = 30

# --- RISK SCHEMAS ---
class RiskAssessmentResponse(BaseModel):
    location_id: str = "ALAKNANDA-VALLEY-01"
    risk_level: str  # LOW | MODERATE | HIGH | CRITICAL
    flood_probability: float
    danger_threshold_m: float = 3.50
    current_water_level: float
    predicted_water_level_30m: float
    confidence_interval: Dict[str, float]
    explanation: str
    recommended_action: str
    color_code: str
    hysteresis_active: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_simulated: bool = True

# --- EVACUATION & MAP SCHEMAS ---
class ShelterResponse(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    elevation_m: float
    capacity: int
    current_occupancy: int
    medical_aid: bool
    food_supplies: str
    status: str
    contact_number: str

    class Config:
        from_attributes = True

class EvacuationRouteRequest(BaseModel):
    origin_latitude: Optional[float] = None
    origin_longitude: Optional[float] = None
    destination_shelter_id: Optional[str] = None
    transport_mode: str = "foot"  # foot | vehicle
    avoid_high_risk: bool = True

class RouteWaypoint(BaseModel):
    name: str
    lat: float
    lon: float
    altitude_m: float
    instruction: str
    hazard_free: bool = True

class EvacuationRouteResponse(BaseModel):
    status: str = "SUCCESS"  # SUCCESS | NO_SAFE_ROUTE_AVAILABLE
    origin_name: str
    origin_coords: List[float]
    destination_name: str
    destination_coords: List[float]
    total_distance_km: float
    estimated_time_minutes: int
    elevation_gain_m: float
    hazard_avoidance_notes: str
    route_polyline: List[List[float]]
    waypoints: List[RouteWaypoint]
    alternative_routes_count: int = 0

class MapRiskZone(BaseModel):
    id: str
    name: str
    level: str  # LOW | MODERATE | HIGH | CRITICAL
    color: str
    coordinates: List[List[float]]
    description: str

# --- ALERT SCHEMAS ---
class AlertResponse(BaseModel):
    id: int
    timestamp: datetime
    risk_level: str
    affected_location: str
    title: str
    message: str
    action_required: str
    flood_probability: float
    email_sent: bool
    siren_triggered: bool
    acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AlertTestRequest(BaseModel):
    risk_level: str = "HIGH"
    recipient_email: Optional[str] = None
    custom_message: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    alert_id: int
    operator_name: str = "Emergency Field Operator"

# --- ANALYTICS SCHEMAS ---
class AnalyticsSummaryResponse(BaseModel):
    system_status: str
    active_sensors_count: int
    active_warnings_count: int
    safe_shelters_count: int
    current_river_level_mean: float
    current_rainfall_mean: float
    soil_saturation_mean: float
    monte_carlo_scenarios_configured: int
    last_updated: datetime

# --- AUTH SCHEMAS ---
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
