from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("A senha precisa ter pelo menos 6 caracteres")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("A senha não pode ter mais de 72 caracteres")
        return v


class UserOut(BaseModel):
    id: int
    email: str
    is_premium: bool
    reminder_time: Optional[str]
    med_reminder_enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("A senha precisa ter pelo menos 6 caracteres")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("A senha não pode ter mais de 72 caracteres")
        return v


class UserPreferences(BaseModel):
    reminder_time: Optional[str] = None        # "22:00" ou null para desativar
    med_reminder_enabled: Optional[bool] = None


# ── Measurements ──────────────────────────────────────────────────────────────

class MeasurementCreate(BaseModel):
    systolic: int
    diastolic: int
    heart_rate: Optional[int] = None
    measured_at: datetime
    arm_used: Optional[str] = None
    feeling: Optional[str] = None
    took_medication: Optional[str] = None


class MeasurementOut(BaseModel):
    id: int
    systolic: int
    diastolic: int
    heart_rate: Optional[int]
    measured_at: datetime
    arm_used: Optional[str]
    feeling: Optional[str]
    took_medication: Optional[str]
    created_at: datetime
    classification: str
    color: str

    model_config = {"from_attributes": True}


# ── Medications ───────────────────────────────────────────────────────────────

class MedicationCreate(BaseModel):
    name:   str
    dosage: Optional[str] = None
    times:  list[str]
    active: bool = True


class MedicationOut(BaseModel):
    id:         int
    name:       str
    dosage:     Optional[str]
    times:      list[str]
    active:     bool
    created_at: datetime

    model_config = {"from_attributes": True}
