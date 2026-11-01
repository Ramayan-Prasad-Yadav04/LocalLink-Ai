import os
import secrets
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FloodWatch AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "floodwatch-ai-sih-2026-secure-secret-key-super-safe")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Hydrological parameters
    DANGER_THRESHOLD_METERS: float = 3.5
    MONTE_CARLO_SCENARIOS: int = 200
    PREDICTION_HORIZON_MINUTES: int = 30
    
    # Hysteresis parameters
    HYSTERESIS_DOWNGRADE_CYCLES: int = 3
    HYSTERESIS_BUFFER_PERCENT: float = 5.0

settings = Settings()
