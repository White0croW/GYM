from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from ..models import Booking, User
from ..schemas import UserCreate


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user: UserCreate):
    db_user = db.query(User).filter(User.id == user_id).first()
    for key, value in user.dict().items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    # Проверяем наличие связанных записей в таблице bookings
    booking_count = db.query(Booking).filter(Booking.user_id == user_id).count()
    if booking_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Невозможно удалить пользователя, так как существуют связанные записи в таблице bookings.",
        )

    # Удаляем пользователя
    db_user = (
        db.query(User)
        .options(joinedload(User.membership))
        .filter(User.id == user_id)
        .first()
    )
    if db_user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(db_user)
    db.commit()
    return db_user
