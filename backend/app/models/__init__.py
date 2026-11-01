from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Index
)
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(50), default="operator")  # operator | admin | viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(50), primary_key=True, index=True)  # e.g., SENS-ALAK-01
    name = Column(String(100), nullable=False)
    sensor_type = Column(String(50), nullable=False)  # radar_water_level | rain_gauge | soil_moisture | multi_telemetry
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    basin_name = Column(String(100), default="Alaknanda Basin")
    status = Column(String(20), default="HEALTHY")  # HEALTHY | DEGRADED | OFFLINE
    danger_mark_m = Column(Float, default=3.50)
    warning_mark_m = Column(Float, default=2.80)
    battery_pct = Column(Float, default=95.0)
    signal_rssi = Column(Integer, default=-68)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), ForeignKey("sensors.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    
    # Raw observed telemetry
    raw_water_level = Column(Float, nullable=True)
    raw_rainfall = Column(Float, nullable=True)
    raw_soil_moisture = Column(Float, nullable=True)

    # Kalman filtered values
    filtered_water_level = Column(Float, nullable=True)
    filtered_rainfall = Column(Float, nullable=True)
    filtered_soil_moisture = Column(Float, nullable=True)
    
    rate_of_rise = Column(Float, default=0.0)  # m/s or m/min
    kalman_variance = Column(Float, default=0.01)
    confidence_score = Column(Float, default=0.95)
    is_simulated = Column(Boolean, default=True)
    data_source = Column(String(20), default="SIMULATED")

    sensor = relationship("Sensor", back_populates="readings")

Index("idx_sensor_time", SensorReading.sensor_id, SensorReading.timestamp)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    prediction_lead_minutes = Column(Integer, default=30)
    
    current_water_level = Column(Float, nullable=False)
    predicted_water_level = Column(Float, nullable=False)
    predicted_change = Column(Float, nullable=False)
    
    ci_lower_95 = Column(Float, nullable=False)
    ci_upper_95 = Column(Float, nullable=False)
    
    flood_probability = Column(Float, nullable=False)  # 0 to 100%
    monte_carlo_samples = Column(Integer, default=1000)
    model_version = Column(String(50), default="Kinematic-Wave-MC-v2")
    is_simulated = Column(Boolean, default=True)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_level = Column(String(20), nullable=False)  # LOW | MODERATE | HIGH | CRITICAL
    flood_probability = Column(Float, nullable=False)
    danger_threshold_m = Column(Float, default=3.50)
    explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    medical_aid = Column(Boolean, default=True)
    food_supplies = Column(String(100), default="Adequate Rations")
    status = Column(String(20), default="OPEN")  # OPEN | FULL | INACCESSIBLE
    contact_number = Column(String(30), default="1078")

class RoadNode(Base):
    __tablename__ = "road_nodes"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    node_type = Column(String(50), default="INTERSECTION")  # ORIGIN | INTERSECTION | RIDGE_PASS | SHELTER
    safety_status = Column(String(20), default="SAFE")  # SAFE | CAUTION | IMPASSABLE

class RoadEdge(Base):
    __tablename__ = "road_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_node_id = Column(String(50), ForeignKey("road_nodes.id"), nullable=False)
    target_node_id = Column(String(50), ForeignKey("road_nodes.id"), nullable=False)
    distance_km = Column(Float, nullable=False)
    travel_time_min = Column(Float, nullable=False)
    flood_risk_score = Column(Float, default=0.0)  # 0.0 safe to 1.0 submerged
    road_status = Column(String(20), default="OPEN")  # OPEN | CAUTION | FLOODED | BLOCKED
    accessibility = Column(String(20), default="ALL")  # ALL | PEDESTRIAN_ONLY | BLOCKED

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_level = Column(String(20), nullable=False)  # LOW | MODERATE | HIGH | CRITICAL
    affected_location = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    action_required = Column(Text, nullable=False)
    flood_probability = Column(Float, default=0.0)
    email_sent = Column(Boolean, default=False)
    siren_triggered = Column(Boolean, default=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
