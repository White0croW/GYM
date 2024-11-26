from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import Membership, MembershipCreate
from ..crud import memberships

router = APIRouter()


@router.post("/", response_model=Membership)
def create_membership(membership: MembershipCreate, db: Session = Depends(get_db)):
    return memberships.create_membership(db=db, membership=membership)


@router.get("/", response_model=List[Membership])
def read_memberships(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    list_memberships = memberships.get_memberships(db, skip=skip, limit=limit)
    return list_memberships


@router.get("/{membership_id}", response_model=Membership)
def read_membership(membership_id: int, db: Session = Depends(get_db)):
    db_membership = memberships.get_membership(db, membership_id=membership_id)
    if db_membership is None:
        raise HTTPException(status_code=404, detail="Membership not found")
    return db_membership


@router.put("/{membership_id}", response_model=Membership)
def update_membership(
    membership_id: int, membership: MembershipCreate, db: Session = Depends(get_db)
):
    return memberships.update_membership(
        db=db, membership_id=membership_id, membership=membership
    )


@router.delete("/{membership_id}", response_model=Membership)
def delete_membership(membership_id: int, db: Session = Depends(get_db)):
    return memberships.delete_membership(db=db, membership_id=membership_id)
