from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import Trainer
from ..schemas import TrainerCreate


def get_trainer(db: Session, trainer_id: int):
    return db.query(Trainer).filter(Trainer.id == trainer_id).first()


def get_trainers(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Trainer).offset(skip).limit(limit).all()


def create_trainer(db: Session, trainer: TrainerCreate):
    db_trainer = Trainer(**trainer.dict())
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer


def update_trainer(db: Session, trainer_id: int, trainer: TrainerCreate):
    db_trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    for key, value in trainer.dict().items():
        setattr(db_trainer, key, value)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer


def delete_trainer(db: Session, trainer_id: int):
    db_trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if db_trainer is None:
        raise HTTPException(status_code=404, detail="Тренер не найден")
    db.delete(db_trainer)
    db.commit()
    return db_trainer
