from typing import List
from pydantic import BaseModel, Field, ConfigDict
from datetime import date, time
from .trainers import Trainer  # Импортируем Trainer из schemas


class WorkoutBase(BaseModel):
    name: str
    description: str
    trainer_id: int
    date: date
    time: time
    capacity: int = Field(..., gt=0)


class WorkoutCreate(WorkoutBase):
    pass


class Workout(WorkoutBase):
    id: int
    trainer: Trainer  # Используем Trainer из schemas

    class Config:
        from_attributes = True


class MostPopularWorkout(BaseModel):
    название: str
    описание: str
    тренер: str
    дата: str
    время: str
    количество_мест: int
    количество_бронирований: int
