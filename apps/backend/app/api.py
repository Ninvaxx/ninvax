from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import SessionLocal, engine
from . import models, crud

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/submit_flag")
def submit_flag(user_id: str, code: str, db: Session = Depends(get_db)):
    """Claim a flag for the given user."""
    success = crud.submit_flag(db, user_id, code)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid flag or already claimed")
    return {"status": "ok"}


@app.get("/user/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Return user data by id."""
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "stripe_id": user.stripe_id,
    }


@app.get("/flags")
def list_flags(db: Session = Depends(get_db)):
    """List all flags."""
    flags = crud.get_all_flags(db)
    return [
        {"id": f.id, "code": f.code, "user_id": f.user_id}
        for f in flags
    ]
