from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/users", tags=["Usuários"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/me/premium", response_model=schemas.UserOut)
def activate_premium(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_user.is_premium = True
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/preferences", response_model=schemas.UserOut)
def update_preferences(
    data: schemas.UserPreferences,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # reminder_time pode ser explicitamente null para desativar
    current_user.reminder_time = data.reminder_time
    # med_reminder_enabled só atualiza se vier no body
    if data.med_reminder_enabled is not None:
        current_user.med_reminder_enabled = data.med_reminder_enabled
    db.commit()
    db.refresh(current_user)
    return current_user
