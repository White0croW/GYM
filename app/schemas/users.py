from pydantic import BaseModel, Field
from typing import Optional, ForwardRef

from app.schemas.memberships import Membership


class UserBase(BaseModel):
    name: str
    email: str
    phone: str


class UserCreate(UserBase):
    membership_id: int


class User(UserBase):
    id: int
    membership: Optional[Membership]

    class Config:
        from_attributes = True
