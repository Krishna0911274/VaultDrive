from datetime import datetime

from sqlalchemy import String, DateTime, BigInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class StoredObject(Base):
    __tablename__ = "stored_objects"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    file_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    file_size: Mapped[int] = mapped_column(BigInteger)
    storage_path: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    