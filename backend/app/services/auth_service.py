import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..core_config import settings
from ..database.db import get_db_connection, verify_password

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def authenticate_user(username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, username, email, hashed_password, role, full_name 
        FROM users 
        WHERE username = ? OR email = ?
    """, (username_or_email, username_or_email))
    user_row = cur.fetchone()
    conn.close()

    if not user_row:
        return None
    
    if not verify_password(password, user_row["hashed_password"]):
        return None

    return {
        "id": user_row["id"],
        "username": user_row["username"],
        "email": user_row["email"],
        "role": user_row["role"],
        "full_name": user_row["full_name"]
    }

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Optional[Dict[str, Any]]:
    """
    Validates token if provided. Allows soft-fallbacks for public status readouts
    while strictly protecting secure control actions.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, email, role, full_name FROM users WHERE username = ?", (payload["sub"],))
    user_row = cur.fetchone()
    conn.close()
    
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return {
        "id": user_row["id"],
        "username": user_row["username"],
        "email": user_row["email"],
        "role": user_row["role"],
        "full_name": user_row["full_name"]
    }
