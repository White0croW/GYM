from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import Booking, BookingCreate
from ..crud import bookings

router = APIRouter()


@router.post("/", response_model=Booking)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    return bookings.create_booking(db=db, booking=booking)


@router.get("/", response_model=List[Booking])
def read_bookings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    list_bookings = bookings.get_bookings(db, skip=skip, limit=limit)
    return list_bookings


@router.get("/{booking_id}", response_model=Booking)
def read_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = bookings.get_booking(db, booking_id=booking_id)
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking


@router.put("/{booking_id}", response_model=Booking)
def update_booking(
    booking_id: int, booking: BookingCreate, db: Session = Depends(get_db)
):
    return bookings.update_booking(db=db, booking_id=booking_id, booking=booking)


@router.delete("/{booking_id}", response_model=Booking)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    return bookings.delete_booking(db=db, booking_id=booking_id)
