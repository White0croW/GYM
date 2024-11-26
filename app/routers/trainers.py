from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import Trainer, TrainerCreate
from ..crud import trainers

router = APIRouter()


@router.post("/", response_model=Trainer)
def create_trainer(trainer: TrainerCreate, db: Session = Depends(get_db)):
    return trainers.create_trainer(db=db, trainer=trainer)


@router.get("/", response_model=List[Trainer])
def read_trainers(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    list_trainers = trainers.get_trainers(db, skip=skip, limit=limit)
    return list_trainers


@router.get("/{trainer_id}", response_model=Trainer)
def read_trainer(trainer_id: int, db: Session = Depends(get_db)):
    db_trainer = trainers.get_trainer(db, trainer_id=trainer_id)
    if db_trainer is None:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return db_trainer


@router.put("/{trainer_id}", response_model=Trainer)
def update_trainer(
    trainer_id: int, trainer: TrainerCreate, db: Session = Depends(get_db)
):
    return trainers.update_trainer(db=db, trainer_id=trainer_id, trainer=trainer)


@router.delete("/{trainer_id}", response_model=Trainer)
def delete_trainer(trainer_id: int, db: Session = Depends(get_db)):
    return trainers.delete_trainer(db=db, trainer_id=trainer_id)
