from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class Folder(Base):
    __tablename__ = "folders"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("folders.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow)
    is_deleted: Mapped[bool] = mapped_column(Boolean,default=False,nullable=False,index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime,nullable=True)
    owner = relationship("User",backref="folders")
    parent = relationship("Folder",remote_side=[id],backref="children")