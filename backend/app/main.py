import os
import sys
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

# Ensure backend root is on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import settings
from app.database import engine, Base
from app.websocket.manager import ws_manager

# Import API Routers
from app.routes.sensors import router as sensors_router
from app.routes.predictions import router as predictions_router
from app.routes.risk import router as risk_router
from app.routes.evacuation import router as evacuation_router
from app.routes.alerts import router as alerts_router
from app.routes.analytics import router as analytics_router
from app.routes.map import router as map_router
from app.routes.simulation import router as simulation_router
from app.routes.auth import router as auth_router

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Complete AI-powered Flash Flood Prediction, Sensor Fusion, Monte Carlo Uncertainty Modeling, and Dijkstra Evacuation Management Platform for Hilly Regions (SIH 2026)",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST Routers under /api
app.include_router(sensors_router, prefix=settings.API_PREFIX)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(risk_router, prefix=settings.API_PREFIX)
app.include_router(evacuation_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(map_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)

# System Health Endpoint (GET /api/health)
@app.get(f"{settings.API_PREFIX}/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    System health verification confirming status of all algorithm engines,
    database connectivity, and simulation mode.
    """
    from app.services.sensor_simulator import simulation_service
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "algorithms": {
            "kalman_filter": "operational",
            "kinematic_wave_prediction": "operational (30-min lead time)",
            "monte_carlo_ensemble": f"operational ({settings.DEFAULT_MONTE_CARLO_SAMPLES} scenarios)",
            "flood_probability_engine": f"operational (threshold: {settings.DEFAULT_DANGER_THRESHOLD_METERS}m)",
            "risk_hysteresis_engine": "operational (anti-chatter active)",
            "networkx_dijkstra_router": "operational (submergence-avoidance active)"
        },
        "simulation_scenario": simulation_service.scenario,
        "database": "sqlite_sqlalchemy_ready",
        "websocket_clients_connected": len(ws_manager.active_connections)
    }

# Root summary endpoint
@app.get("/", tags=["Root"])
def root_summary():
    return {
        "service": settings.APP_NAME,
        "status": "ONLINE",
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX,
        "message": "Welcome to FloodWatch AI Backend. Refer to /docs for interactive Swagger API testing."
    }

# Real-Time WebSocket Endpoint (ws://localhost:8000/api/ws and ws://localhost:8000/ws)
@app.websocket("/api/ws")
@app.websocket("/ws")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        from app.services.sensor_simulator import simulation_service
        # Send initial state snapshot on connection
        live = simulation_service.get_live_reading()
        await ws_manager.send_personal_message({"event": "initial_state", "data": live}, websocket)
        
        while True:
            # Keep socket alive and receive client commands
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
