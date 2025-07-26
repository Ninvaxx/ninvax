"""Initial database seeding script.

This script is safe to run multiple times. Existing records will not be
duplicated.
"""

import uuid

from .database import SessionLocal, engine
from .models import Base, Flag

Base.metadata.create_all(bind=engine)

FLAGS = [
    "FLAG{init_protocol_ninvax}",
    "FLAG{ghostshell_activated}",
]


def seed_flags() -> None:
    """Insert seed flags if they do not already exist."""

    db = SessionLocal()
    try:
        for code in FLAGS:
            exists = db.query(Flag).filter(Flag.code == code).first()
            if not exists:
                db.add(Flag(id=str(uuid.uuid4()), code=code))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_flags()
