from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_premium = Column(Boolean, default=False)

    # Lembrete de aferição de pressão: envia e-mail se não aferiu até este horário
    reminder_time = Column(String, nullable=True)           # ex: "22:00" ou None (desativado)
    # Lembretes de medicamentos: liga/desliga todos os e-mails de remédio
    med_reminder_enabled = Column(Boolean, default=True, server_default="1", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    measurements = relationship("Measurement", back_populates="owner", cascade="all, delete-orphan")
    medications  = relationship("Medication",  back_populates="owner", cascade="all, delete-orphan")


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    systolic  = Column(Integer, nullable=False)
    diastolic = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=True)
    measured_at = Column(DateTime(timezone=True), nullable=False)
    arm_used = Column(String, nullable=True)
    feeling = Column(String, nullable=True)
    took_medication = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="measurements")


class Medication(Base):
    __tablename__ = "medications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    dosage     = Column(String, nullable=True)
    times      = Column(String, nullable=False)   # "08:00,20:00"
    active     = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="medications")
