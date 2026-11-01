import os
from typing import List, Optional
from pydantic import BaseModel, Field

class Settings(BaseModel):
    # Application Info
    APP_NAME: str = "FloodWatch AI – Hydrology & Disaster Warning Engine"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./backend/app/database/floodwatch.db")

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "floodwatch-ai-super-secret-key-sih-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Hydrological Model Default Thresholds
    DEFAULT_DANGER_THRESHOLD_METERS: float = 3.50
    DEFAULT_WARNING_THRESHOLD_METERS: float = 2.80
    DEFAULT_CLOUDBURST_RAIN_MM_HR: float = 100.0
    DEFAULT_MONTE_CARLO_SAMPLES: int = 1000

    # Risk Classification Thresholds (%)
    RISK_LOW_MAX: float = 20.0
    RISK_MODERATE_MAX: float = 40.0
    RISK_HIGH_MAX: float = 70.0
    RISK_CRITICAL_MAX: float = 100.0

    # Email Alert Configuration (SMTP)
    SMTP_ENABLED: bool = os.getenv("SMTP_ENABLED", "false").lower() in ("true", "1", "yes")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    ALERT_SENDER_EMAIL: str = os.getenv("ALERT_SENDER_EMAIL", "alerts@floodwatch.ai")
    DEFAULT_ALERT_RECIPIENTS: List[str] = ["operator@floodwatch.ai", "sdrf-control@uk.gov.in"]

    # Simulation Defaults
    DEFAULT_SIMULATION_SCENARIO: str = "normal"  # normal | warning | extreme

settings = Settings()
