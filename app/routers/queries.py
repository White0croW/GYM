from fastapi import APIRouter, Depends
from datetime import date
from sqlalchemy.orm import Session
from typing import List

from app.schemas.memberships import UserMembershipQuery
from app.schemas.workouts import MostPopularWorkout, Workout
from app.schemas.trainers import TrainerWorkoutCount
from ..database import get_db
from ..queries import queries

router = APIRouter()


@router.get("/most-popular-workout", response_model=MostPopularWorkout)
def get_most_popular_workout(db: Session = Depends(get_db)):
    return queries.get_most_popular_workout(db)


@router.get("/trainers-with-most-workouts", response_model=List[TrainerWorkoutCount])
def get_trainers_with_most_workouts(db: Session = Depends(get_db)):
    trainers = queries.get_trainers_with_most_workouts(db)
    return trainers


@router.get(
    "/users-with-expiring-memberships", response_model=List[UserMembershipQuery]
)
def get_users_with_expiring_memberships(db: Session = Depends(get_db)):
    return queries.get_users_with_expiring_memberships(db)


# @router.get("/trainers/{trainer_id}/workouts")
# def get_workouts_by_trainer(trainer_id: int, db: Session = Depends(get_db)):
#     return queries.get_workouts_by_trainer(db, trainer_id)


# @router.get("/users/{user_id}/bookings")
# def get_bookings_by_user(user_id: int, db: Session = Depends(get_db)):
#     return queries.get_bookings_by_user(db, user_id)


# @router.get("/workouts-by-date", response_model=List[Workout])
# def get_workouts_by_date(date: date, db: Session = Depends(get_db)):
#     workouts = queries.get_workouts_by_date(db, date)
#     return workouts
