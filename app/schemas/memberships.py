from pydantic import BaseModel, validator
from datetime import date
from typing import List, Optional, ForwardRef


class MembershipBase(BaseModel):
    type: str
    start_date: date
    end_date: date

    @validator("end_date")
    def end_date_must_be_greater_than_start_date(cls, v, values):
        if "start_date" in values and v <= values["start_date"]:
            raise ValueError("Дата окончания должна быть больше даты начала")
        return v


class MembershipCreate(MembershipBase):
    pass


class Membership(MembershipBase):
    id: int

    class Config:
        from_attributes = True


class UserMembershipQuery(BaseModel):
    имя: str
    email: str
    телефон: str
    тип_членства: str
    дата_окончания: date
    оставшиеся_дни: int
