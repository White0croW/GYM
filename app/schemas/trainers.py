from pydantic import BaseModel, ConfigDict


class TrainerBase(BaseModel):
    name: str
    specialization: str


class TrainerCreate(TrainerBase):
    pass


class Trainer(TrainerBase):
    id: int

    class Config:
        from_attributes = True


from pydantic import BaseModel
from .trainers import Trainer


class TrainerWorkoutCount(BaseModel):
    тренер: str
    специализация: str
    количество_тренировок: int
