from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    String,
    DateTime,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False,index=True)
    
    folder_id: Mapped[int] = mapped_column(ForeignKey("folders.id"), nullable=False,index=True)

    role: Mapped[str] = mapped_column(String(20), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="permissions")

    folder = relationship("Folder", backref="permissions")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "folder_id",
            name="unique_user_folder_permission"
        ),
    )