from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from ..models import Booking
from ..schemas import BookingCreate


def get_booking(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()


def get_bookings(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Booking).offset(skip).limit(limit).all()


def create_booking(db: Session, booking: BookingCreate):
    db_booking = Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def update_booking(db: Session, booking_id: int, booking: BookingCreate):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    for key, value in booking.dict().items():
        setattr(db_booking, key, value)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def delete_booking(db: Session, booking_id: int):
    db_booking = (
        db.query(Booking)
        .options(joinedload(Booking.user), joinedload(Booking.workout))
        .filter(Booking.id == booking_id)
        .first()
    )
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    db.delete(db_booking)
    db.commit()
    return db_booking
