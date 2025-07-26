"""High level user related operations."""

from sqlalchemy.orm import Session

from .. import crud


def register_user(db: Session, email: str, stripe_id: str | None = None):
    """Register a new user if needed and return the user instance."""
    return crud.create_user(db, email, stripe_id=stripe_id)


def claim_flag(db: Session, user_id: str, code: str) -> bool:
    """Wrapper around :func:`crud.submit_flag`."""
    return crud.submit_flag(db, user_id, code)
