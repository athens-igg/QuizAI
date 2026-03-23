from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from database import SessionLocal
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from models import UserDB
import time

router = APIRouter()

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# TEMP DB (later replace with real DB)
#users_db = {}
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(BaseModel):
    email: str
    password: str


def hash_password(password: str):
    return pwd_context.hash(password[:72])


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_token(username):
    payload = {
        "sub": username,
        "exp": time.time() + 3600
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/signup")
def signup(user: User, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = UserDB(
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    #users_db[user.username] = hash_password(user.password)
    return {"message": "User created"}


@router.post("/login")
def login(user: User, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = create_token(user.email)
    return {"token": token}