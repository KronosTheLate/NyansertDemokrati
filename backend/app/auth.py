import os
from dotenv import load_dotenv

# Try to load the .env file from the frontend directory if it exists
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', '.env')
load_dotenv(dotenv_path)

from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from .database import get_db
from .models import User

GOOGLE_CLIENT_ID = os.environ.get("VITE_GOOGLE_CLIENT_ID", os.environ.get("GOOGLE_CLIENT_ID"))
JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-key-for-dev")
JWT_ALGORITHM = "HS256"

security = HTTPBearer()

def verify_google_token(token: str) -> dict:
    try:
        if not GOOGLE_CLIENT_ID:
            raise ValueError("GOOGLE_CLIENT_ID is not configured on the backend.")
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds=60
        )
        return idinfo
    except ValueError as e:
        print(f"DEBUG auth fails: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
