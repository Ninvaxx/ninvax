"""SQLAlchemy ORM models for the Ninvax backend."""

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

class User(Base):
    """Registered application user."""

    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    stripe_id = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    flags = relationship("Flag", back_populates="user")
    subscription = relationship(
        "Subscription", uselist=False, back_populates="user"
    )

class Subscription(Base):
    """User subscription status."""

    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    status = Column(String)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="subscription")

class Flag(Base):
    """Hidden flag that can be claimed by a user."""

    __tablename__ = "flags"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="flags")

