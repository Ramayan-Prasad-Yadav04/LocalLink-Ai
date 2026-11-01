from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, Optional
from ..schemas import UserLogin, Token, UserResponse
from ..config import settings
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Operator Authentication"])

DEMO_USERS = {
    "operator": {
        "id": 1,
        "username": "operator",
        "email": "operator@floodwatch.ai",
        "full_name": "Emergency Field Operator",
        "role": "Emergency Field Operator",
        "password": "Flood@2026"
    },
    "admin": {
        "id": 2,
        "username": "admin",
        "email": "admin@floodwatch.ai",
        "full_name": "Disaster System Administrator",
        "role": "System Administrator",
        "password": "Admin@Flood2026"
    }
}

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticate emergency control room operator."""
    user = DEMO_USERS.get(credentials.username)
    if not user or user["password"] != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Please verify credentials."
        )

    token = create_access_token({"sub": user["username"], "role": user["role"]})
    user_data = dict(user)
    del user_data["password"]
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    """Retrieve logged-in operator profile."""
    user = dict(DEMO_USERS["operator"])
    del user["password"]
    return user
