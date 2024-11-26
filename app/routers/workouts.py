from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import Workout, WorkoutCreate
from ..crud import workouts

router = APIRouter()


@router.post("/", response_model=Workout)
def create_workout(workout: WorkoutCreate, db: Session = Depends(get_db)):
    return workouts.create_workout(db=db, workout=workout)


@router.get("/", response_model=List[Workout])
def read_workouts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    workouts_list = workouts.get_workouts(db, skip=skip, limit=limit)
    return workouts_list


@router.get("/{workout_id}", response_model=Workout)
def read_workout(workout_id: int, db: Session = Depends(get_db)):
    db_workout = workouts.get_workout(db, workout_id=workout_id)
    if db_workout is None:
        raise HTTPException(status_code=404, detail="Workout not found")
    return db_workout


@router.put("/{workout_id}", response_model=Workout)
def update_workout(
    workout_id: int, workout: WorkoutCreate, db: Session = Depends(get_db)
):
    return workouts.update_workout(db=db, workout_id=workout_id, workout=workout)


@router.delete("/{workout_id}", response_model=Workout)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    return workouts.delete_workout(db=db, workout_id=workout_id)
