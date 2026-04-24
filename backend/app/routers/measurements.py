from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/measurements", tags=["Medições"])


def classify_pressure(systolic: int, diastolic: int) -> dict:
    if systolic > 180 or diastolic > 120:
        return {"classification": "Crise Hipertensiva", "color": "darkred"}
    if systolic >= 140 or diastolic >= 90:
        return {"classification": "Hipertensão Grau 2", "color": "red"}
    if systolic >= 130 or diastolic >= 80:
        return {"classification": "Hipertensão Grau 1", "color": "orange"}
    if 120 <= systolic <= 129 and diastolic < 80:
        return {"classification": "Elevada", "color": "yellow"}
    return {"classification": "Normal", "color": "green"}


def measurement_to_out(m: models.Measurement) -> schemas.MeasurementOut:
    cls = classify_pressure(m.systolic, m.diastolic)
    return schemas.MeasurementOut(
        id=m.id,
        systolic=m.systolic,
        diastolic=m.diastolic,
        heart_rate=m.heart_rate,
        measured_at=m.measured_at,
        arm_used=m.arm_used,
        feeling=m.feeling,
        took_medication=m.took_medication,
        created_at=m.created_at,
        classification=cls["classification"],
        color=cls["color"],
    )


@router.post("", response_model=schemas.MeasurementOut, status_code=status.HTTP_201_CREATED)
def create_measurement(
    data: schemas.MeasurementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    measurement = models.Measurement(user_id=current_user.id, **data.model_dump())
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement_to_out(measurement)


@router.get("", response_model=List[schemas.MeasurementOut])
def list_measurements(
    days: Optional[int] = Query(None, description="Filtrar pelos últimos N dias"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Plano gratuito: máximo 30 dias
    if not current_user.is_premium:
        max_days = 30
        if days is None or days > max_days:
            days = max_days

    query = db.query(models.Measurement).filter(models.Measurement.user_id == current_user.id)

    if days:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(models.Measurement.measured_at >= since)

    results = query.order_by(models.Measurement.measured_at.desc()).all()
    return [measurement_to_out(m) for m in results]


@router.put("/{measurement_id}", response_model=schemas.MeasurementOut)
def update_measurement(
    measurement_id: int,
    data: schemas.MeasurementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    measurement = (
        db.query(models.Measurement)
        .filter(models.Measurement.id == measurement_id, models.Measurement.user_id == current_user.id)
        .first()
    )
    if not measurement:
        raise HTTPException(status_code=404, detail="Medição não encontrada")

    for field, value in data.model_dump().items():
        setattr(measurement, field, value)

    db.commit()
    db.refresh(measurement)
    return measurement_to_out(measurement)


@router.delete("/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    measurement = (
        db.query(models.Measurement)
        .filter(models.Measurement.id == measurement_id, models.Measurement.user_id == current_user.id)
        .first()
    )
    if not measurement:
        raise HTTPException(status_code=404, detail="Medição não encontrada")
    db.delete(measurement)
    db.commit()
