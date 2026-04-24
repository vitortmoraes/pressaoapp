import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from ..email_utils import email_password_reset

router = APIRouter(prefix="/auth", tags=["Autenticação"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    user = models.User(
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/forgot-password", status_code=200)
def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    # Resposta genérica mesmo se o e-mail não existir (evita enumeração de usuários)
    if user:
        token = jwt.encode(
            {
                "sub": str(user.id),
                "purpose": "reset",
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        email_password_reset(user.email, reset_link)

    return {"message": "Se este e-mail estiver cadastrado, você receberá as instruções em breve."}


@router.post("/reset-password", status_code=200)
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    credentials_error = HTTPException(status_code=400, detail="Link inválido ou expirado.")
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "reset":
            raise credentials_error
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_error
    except JWTError:
        raise credentials_error

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise credentials_error

    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Senha redefinida com sucesso."}
