"""SQLAlchemy ORM models for the Ninvax backend."""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Integer
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
    journal_entries = relationship("JournalEntry", back_populates="user")
    mood_logs = relationship("MoodLog", back_populates="user")
    ai_actions = relationship("AIAction", back_populates="user")

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


class JournalEntry(Base):
    """Free-form journal text created by a user."""

    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="journal_entries")


class MoodLog(Base):
    """Logs of mood with a numeric score."""

    __tablename__ = "mood_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    mood = Column(String)
    score = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mood_logs")


class AIAction(Base):
    """Record of an action taken by the assistant."""

    __tablename__ = "ai_actions"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ai_actions")

