"""Database CRUD helper functions."""

from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from . import models


def create_user(db: Session, email: str, stripe_id: Optional[str] = None) -> Optional[models.User]:
    """Create a new user record if one does not already exist."""
    existing = get_user_by_email(db, email)
    if existing:
        return existing

    user = models.User(id=str(uuid.uuid4()), email=email, stripe_id=stripe_id)
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except SQLAlchemyError:
        db.rollback()
        return None


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Retrieve a user by email."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_subscription(db: Session, user_id: str, status: str) -> Optional[models.Subscription]:
    """Create a subscription for a user."""
    sub = models.Subscription(id=str(uuid.uuid4()), user_id=user_id, status=status)
    try:
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return sub
    except SQLAlchemyError:
        db.rollback()
        return None


def create_flag(db: Session, code: str, user_id: Optional[str] = None) -> Optional[models.Flag]:
    """Create a flag."""
    flag = models.Flag(id=str(uuid.uuid4()), code=code, user_id=user_id)
    try:
        db.add(flag)
        db.commit()
        db.refresh(flag)
        return flag
    except SQLAlchemyError:
        db.rollback()
        return None


def submit_flag(db: Session, user_id: str, code: str) -> bool:
    """Attempt to claim a flag for a user.

    Returns True on success, False if the flag does not exist or is already claimed.
    """
    flag = db.query(models.Flag).filter(models.Flag.code == code).first()
    if not flag or flag.user_id:
        return False

    try:
        flag.user_id = user_id
        db.commit()
        return True
    except SQLAlchemyError:
        db.rollback()
        return False


def get_found_flags(db: Session, user_id: str) -> List[models.Flag]:
    """Return all flags claimed by a user."""
    return db.query(models.Flag).filter(models.Flag.user_id == user_id).all()



def get_user(db: Session, user_id: str) -> Optional[models.User]:
    """Retrieve a user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_all_flags(db: Session) -> List[models.Flag]:
    """Return all flags."""
    return db.query(models.Flag).all()
