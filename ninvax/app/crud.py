from sqlalchemy.orm import Session
from . import models


def create_user(db: Session, user_id: str, email: str, stripe_id: str = None):
    user = models.User(id=user_id, email=email, stripe_id=stripe_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_subscription(db: Session, sub_id: str, user_id: str, status: str):
    subscription = models.Subscription(id=sub_id, user_id=user_id, status=status)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def create_flag(db: Session, flag_id: str, code: str, user_id: str = None):
    flag = models.Flag(id=flag_id, code=code, user_id=user_id)
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag
