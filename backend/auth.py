from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
import time

router = APIRouter()

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# TEMP DB (later replace with real DB)
users_db = {}

class User(BaseModel):
    username: str
    password: str


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_token(username):
    payload = {
        "sub": username,
        "exp": time.time() + 3600
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/signup")
def signup(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User exists")

    users_db[user.username] = hash_password(user.password)
    return {"message": "User created"}


@router.post("/login")
def login(user: User):
    if user.username not in users_db:
        raise HTTPException(status_code=400, detail="Invalid user")

    if not verify_password(user.password, users_db[user.username]):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = create_token(user.username)
    return {"token": token}