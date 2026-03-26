from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from database import SessionLocal, get_db
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from models import UserDB
import time
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
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
    email: EmailStr
    password: str
    name: str | None = None
    description: str | None = None


def hash_password(password: str):
    return pwd_context.hash(password[:72])


def verify_password(password, hashed):
    return pwd_context.verify(password[:72], hashed)

def create_token(username):
    payload = {
        "sub": username,
        "exp": time.time() + 3600
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(UserDB).filter(UserDB.email == email).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.post("/signup")
def signup(user: User, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = UserDB(
        email=user.email,
        hashed_password=hash_password(user.password),
        #name=user.name if user.name else get_name_from_email(user.email),
        name=user.name or user.email.split("@")[0],
        #description=user.description if user.description else "add a description to enhance your profile"
        description=user.description or "add a description to enhance your profile"
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
    return {"token": token,"token_type": "bearer"}