import sqlite3
import hashlib
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "floodwatch.db")

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Secure PBKDF2 password hashing with salt."""
    if not salt:
        salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${key}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$key."""
    try:
        salt, key = stored_hash.split('$')
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return secrets_compare(key, new_key)
    except Exception:
        return False

def secrets_compare(val1: str, val2: str) -> bool:
    """Constant time string comparison."""
    import hmac
    return hmac.compare_digest(val1, val2)

def get_db_connection() -> sqlite3.Connection:
    """Return a connection to the SQLite database with row factory."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables and seed demo records."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator',
        full_name TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Sensor Readings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        rainfall REAL NOT NULL,
        soil_moisture REAL NOT NULL,
        water_level REAL NOT NULL,
        raw_water_level REAL NOT NULL,
        rate_of_rise REAL NOT NULL,
        station_id TEXT NOT NULL
    )
    """)

    # Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        current_water_level REAL NOT NULL,
        mean_water_level REAL NOT NULL,
        flood_probability REAL NOT NULL,
        ci_lower REAL NOT NULL,
        ci_upper REAL NOT NULL,
        danger_threshold REAL NOT NULL,
        risk_level TEXT NOT NULL,
        time_series_json TEXT NOT NULL
    )
    """)

    # Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        action_required TEXT NOT NULL,
        siren_triggered INTEGER NOT NULL DEFAULT 0,
        acknowledged INTEGER NOT NULL DEFAULT 0
    )
    """)

    # Shelters Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shelters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        elevation_m REAL NOT NULL,
        capacity INTEGER NOT NULL,
        occupancy INTEGER NOT NULL,
        contact_phone TEXT NOT NULL
    )
    """)

    # Sensor Locations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        elevation_m REAL NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # Seed Users
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        demo_users = [
            ("admin", "admin@floodwatch.ai", hash_password("Admin@123"), "commander", "Disaster Management Commander"),
            ("operator", "operator@floodwatch.ai", hash_password("Flood@2026"), "operator", "Emergency Field Operator"),
            ("sih_judge", "judge@sih2026.gov.in", hash_password("Judge@2026"), "evaluator", "SIH 2026 Grand Jury")
        ]
        cursor.executemany("""
            INSERT INTO users (username, email, hashed_password, role, full_name, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        """, demo_users)

    # Seed Shelters (Realistic hilly terrain: Chamoli / Mandakini River Valley, Uttarakhand)
    cursor.execute("SELECT COUNT(*) FROM shelters")
    if cursor.fetchone()[0] == 0:
        demo_shelters = [
            ("SHELTER-01", "Pine Ridge Community High Ground", 30.1585, 78.8020, 1420.0, 500, 112, "+91 94120 11001"),
            ("SHELTER-02", "Civil Hospital Disaster Wing (Upper Terraces)", 30.1490, 78.8150, 1380.0, 350, 64, "+91 94120 11002"),
            ("SHELTER-03", "St. Jude Mountain Academy Relief Center", 30.1650, 78.7880, 1510.0, 600, 45, "+91 94120 11003"),
            ("SHELTER-04", "Govt ITI Hilltop Safe Haven", 30.1340, 78.8250, 1340.0, 250, 30, "+91 94120 11004")
        ]
        cursor.executemany("""
            INSERT INTO shelters (id, name, lat, lon, elevation_m, capacity, occupancy, contact_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_shelters)

    # Seed Sensor Locations
    cursor.execute("SELECT COUNT(*) FROM sensor_locations")
    if cursor.fetchone()[0] == 0:
        demo_sensors = [
            ("SENSOR-RIV-01", "Alaknanda Basin Gauge Alpha (Upstream Gorge)", "river_gauge", 30.1415, 78.7890, 1180.0, "active"),
            ("SENSOR-RIV-02", "Confluence Flash Monitor Beta (Lower Valley)", "river_gauge", 30.1350, 78.7950, 1145.0, "active"),
            ("SENSOR-RAIN-01", "Cloudburst Radar Rain Gauge (Ridge Peak)", "rain_gauge", 30.1620, 78.7780, 1680.0, "active"),
            ("SENSOR-SOIL-01", "Soil Moisture Volumetric Probe Array (Slope 4)", "soil_probe", 30.1510, 78.7840, 1260.0, "active")
        ]
        cursor.executemany("""
            INSERT INTO sensor_locations (id, name, type, lat, lon, elevation_m, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, demo_sensors)

    # Seed initial alerts
    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        demo_alerts = [
            ("ALERT-INIT-01", datetime.now().isoformat(), "LOW", "System Online & Calibrated", 
             "Telemetry sensors calibrated. Kalman filters initialized. Hydro-meteorological models running 200 Monte-Carlo scenarios.", 
             "Maintain routine 2-second telemetry monitoring.", 0, 1)
        ]
        cursor.executemany("""
            INSERT INTO alerts (id, timestamp, risk_level, title, message, action_required, siren_triggered, acknowledged)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_alerts)

    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()
