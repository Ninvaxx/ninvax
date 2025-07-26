"""Database session and engine setup."""

import logging
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv


log = logging.getLogger(__name__)

# Load variables from a .env if present
load_dotenv()

# Provide a reasonable default so the application can still start for local
# development if DATABASE_URL is not configured.  Using SQLite keeps the initial
# setup simple while allowing production deployments to specify Postgres.
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./ninvax.db"
if not os.getenv("DATABASE_URL"):
    log.warning(
        "DATABASE_URL not found in environment, defaulting to local SQLite file"
    )

# Create SQLAlchemy engine and session factory
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

