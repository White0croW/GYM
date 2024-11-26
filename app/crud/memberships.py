from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import Membership, User
from ..schemas import MembershipCreate


def get_membership(db: Session, membership_id: int):
    return db.query(Membership).filter(Membership.id == membership_id).first()


def get_memberships(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Membership).offset(skip).limit(limit).all()


def create_membership(db: Session, membership: MembershipCreate):
    db_membership = Membership(**membership.dict())
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership


def update_membership(db: Session, membership_id: int, membership: MembershipCreate):
    db_membership = db.query(Membership).filter(Membership.id == membership_id).first()
    for key, value in membership.dict().items():
        setattr(db_membership, key, value)
    db.commit()
    db.refresh(db_membership)
    return db_membership


def delete_membership(db: Session, membership_id: int):
    # Проверяем наличие связанных записей в таблице bookings
    booking_count = db.query(User).filter(User.membership_id == membership_id).count()
    if booking_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Невозможно удалить членство, так как существуют связанные записи в таблице bookings.",
        )

    # Удаляем членство
    db_membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if db_membership is None:
        raise HTTPException(status_code=404, detail="Членство не найдено")
    db.delete(db_membership)
    db.commit()
    return db_membership
