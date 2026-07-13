import os
import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from database import get_db

router = APIRouter()

bearer = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

JWT_SECRET = os.getenv("JWT_SECRET", "devscope-secret")
JWT_ALGO = "HS256"
JWT_EXPIRE_DAYS = 30


def make_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class AuthRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(body: AuthRequest):
    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(body.password)
    cursor = db.execute(
        "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
        (body.email, hashed),
    )
    db.commit()
    user_id = cursor.lastrowid
    db.close()
    token = make_token(user_id, body.email)
    return {"token": token, "user": {"id": user_id, "email": body.email}}


@router.post("/login")
def login(body: AuthRequest):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (body.email,)).fetchone()
    db.close()
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"]}}


@router.get("/me")
def me(payload: dict = Depends(verify_token)):
    return {"id": payload["sub"], "email": payload["email"]}
