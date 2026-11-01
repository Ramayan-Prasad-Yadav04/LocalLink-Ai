from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging

logger = logging.getLogger("floodwatch.websocket")

class ConnectionManager:
    """
    WebSocket connection manager for real-time telemetry streaming and emergency broadcasting.
    
    Supported Events:
      - sensor_update
      - prediction_update
      - risk_update
      - evacuation_update
      - emergency_alert
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        """Broadcasts a typed JSON payload to all active clients."""
        payload = {
            "event": event_type,
            "data": data
        }
        message_str = json.dumps(payload)
        
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.warning(f"Error broadcasting to client: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

# Global WebSocket Manager
ws_manager = ConnectionManager()
