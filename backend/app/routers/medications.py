from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/medications", tags=["Medicamentos"])


def med_to_out(m: models.Medication) -> schemas.MedicationOut:
    return schemas.MedicationOut(
        id=m.id,
        name=m.name,
        dosage=m.dosage,
        times=[t.strip() for t in m.times.split(",") if t.strip()] if m.times else [],
        active=m.active,
        created_at=m.created_at,
    )


@router.get("", response_model=List[schemas.MedicationOut])
def list_medications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    results = db.query(models.Medication).filter(
        models.Medication.user_id == current_user.id
    ).order_by(models.Medication.name).all()
    return [med_to_out(m) for m in results]


@router.post("", response_model=schemas.MedicationOut, status_code=status.HTTP_201_CREATED)
def create_medication(
    data: schemas.MedicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = models.Medication(
        user_id=current_user.id,
        name=data.name,
        dosage=data.dosage,
        times=",".join(data.times),
        active=data.active,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med_to_out(med)


@router.put("/{med_id}", response_model=schemas.MedicationOut)
def update_medication(
    med_id: int,
    data: schemas.MedicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = db.query(models.Medication).filter(
        models.Medication.id == med_id,
        models.Medication.user_id == current_user.id,
    ).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    med.name   = data.name
    med.dosage = data.dosage
    med.times  = ",".join(data.times)
    med.active = data.active
    db.commit()
    db.refresh(med)
    return med_to_out(med)


@router.delete("/{med_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(
    med_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = db.query(models.Medication).filter(
        models.Medication.id == med_id,
        models.Medication.user_id == current_user.id,
    ).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    db.delete(med)
    db.commit()
