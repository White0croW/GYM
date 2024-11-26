from pydantic import BaseModel, ConfigDict
from .users import User  # Импортируем User из schemas
from .workouts import Workout  # Импортируем Workout из schemas


class BookingBase(BaseModel):
    user_id: int
    workout_id: int


class BookingCreate(BookingBase):
    pass


class Booking(BookingBase):
    id: int
    user: User  # Используем User из schemas
    workout: Workout  # Используем Workout из schemas

    class Config:
        from_attributes = True
