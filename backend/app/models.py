from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    measurements = relationship("Measurement", back_populates="owner", cascade="all, delete-orphan")


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    systolic = Column(Integer, nullable=False)       # pressão sistólica (mmHg)
    diastolic = Column(Integer, nullable=False)      # pressão diastólica (mmHg)
    heart_rate = Column(Integer, nullable=True)      # frequência cardíaca (bpm)
    measured_at = Column(DateTime(timezone=True), nullable=False)
    arm_used = Column(String, nullable=True)         # "esquerdo" ou "direito"
    feeling = Column(String, nullable=True)          # como estava se sentindo
    took_medication = Column(String, nullable=True)  # "sim", "nao", "parcialmente"

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="measurements")
