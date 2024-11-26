from sqlalchemy.orm import Session
from ..models import Workout
from ..schemas import WorkoutCreate


def get_workout(db: Session, workout_id: int):
    return db.query(Workout).filter(Workout.id == workout_id).first()


def get_workouts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Workout).offset(skip).limit(limit).all()


def create_workout(db: Session, workout: WorkoutCreate):
    # Проверка уникальности имени
    if db.query(Workout).filter(Workout.name == workout.name).first():
        raise HTTPException(
            status_code=400, detail="Тренировка с таким именем уже существует"
        )
    db_workout = Workout(**workout.dict())
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout


def update_workout(db: Session, workout_id: int, workout: WorkoutCreate):
    db_workout = db.query(Workout).filter(Workout.id == workout_id).first()
    for key, value in workout.dict().items():
        setattr(db_workout, key, value)
    db.commit()
    db.refresh(db_workout)
    return db_workout


from fastapi import HTTPException


from fastapi import HTTPException
from sqlalchemy.orm import joinedload


def delete_workout(db: Session, workout_id: int):
    db_workout = (
        db.query(Workout)
        .options(joinedload(Workout.trainer))
        .filter(Workout.id == workout_id)
        .first()
    )
    if db_workout is None:
        raise HTTPException(status_code=404, detail="Тренировка не найдена")
    db.delete(db_workout)
    db.commit()
    return db_workout
