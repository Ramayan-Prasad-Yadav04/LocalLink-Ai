from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime
from ..schemas import AlertResponse, AlertTestRequest, AlertAcknowledgeRequest
from ..services.alert_service import alert_service
from ..services.sensor_simulator import simulation_service
from ..websocket.manager import ws_manager

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])

# In-memory alert store with baseline realistic logged alerts
_ALERTS_STORE = [
    {
        "id": 1,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "risk_level": "LOW",
        "affected_location": "Mandakini Valley (Zone 0)",
        "title": "Hydrometric Baseline Nominal",
        "message": "All stream levels in Alaknanda basin operating within normal seasonal flow range.",
        "action_required": "Routine automated monitoring continuing.",
        "flood_probability": 0.0,
        "email_sent": True,
        "siren_triggered": False,
        "acknowledged": True,
        "acknowledged_by": "System Auto",
        "acknowledged_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
]

@router.get("", response_model=List[Dict[str, Any]])
async def get_recent_alerts():
    """Retrieve recent emergency alerts and civil protection advisories."""
    return _ALERTS_STORE

@router.post("/test", response_model=Dict[str, Any])
async def trigger_test_alert(req: AlertTestRequest):
    """
    Test broadcast simulation: generates an alert, logs to audit history,
    triggers WebSocket emergency broadcast, and tests email dispatcher.
    """
    alert_data = alert_service.dispatch_alert(
        risk_level=req.risk_level,
        affected_location="Alaknanda & Mandakini Valley (Chamoli Sector)",
        flood_probability=85.0 if req.risk_level == "CRITICAL" else 45.0,
        recommended_action=req.custom_message or "EVACUATE LOWLANDS: Move to high ground immediately.",
        recipients=[req.recipient_email] if req.recipient_email else None
    )

    new_id = len(_ALERTS_STORE) + 1
    stored_alert = {
        "id": new_id,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "risk_level": alert_data["risk_level"],
        "affected_location": alert_data["affected_location"],
        "title": alert_data["title"],
        "message": alert_data["message"],
        "action_required": alert_data["action_required"],
        "flood_probability": alert_data["flood_probability"],
        "email_sent": alert_data["email_sent"],
        "siren_triggered": alert_data["siren_triggered"],
        "acknowledged": False,
        "acknowledged_by": None,
        "acknowledged_at": None
    }
    _ALERTS_STORE.insert(0, stored_alert)

    # Broadcast event via WebSocket
    await ws_manager.broadcast_event("emergency_alert", stored_alert)
    return stored_alert

@router.post("/acknowledge", response_model=Dict[str, Any])
async def acknowledge_alert(req: AlertAcknowledgeRequest):
    """Mark an emergency alert as acknowledged by the control room operator."""
    for alert in _ALERTS_STORE:
        if alert["id"] == req.alert_id:
            alert["acknowledged"] = True
            alert["acknowledged_by"] = req.operator_name
            alert["acknowledged_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            return {
                "status": "success",
                "alert_id": req.alert_id,
                "acknowledged": True,
                "acknowledged_by": req.operator_name
            }
    return {"status": "success", "alert_id": req.alert_id, "acknowledged": True}
