from .database import SessionLocal, engine
from .models import Base, Flag
import uuid

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    db.add_all([
        Flag(id=str(uuid.uuid4()), code="FLAG{init_protocol_ninvax}"),
        Flag(id=str(uuid.uuid4()), code="FLAG{ghostshell_activated}")
    ])
    db.commit()
finally:
    db.close()
