from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.folder import Folder
from app.models.permission import Permission


def get_folder_role(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if current_folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # Start checking from the current folder
    folder = current_folder

    while folder is not None:

        # Owner of the folder has full access
        if folder.owner_id == current_user.id:
            return "owner"

        # Check if user has permission on this folder
        permission = db.query(Permission).filter(
            Permission.user_id == current_user.id,
            Permission.folder_id == folder.id
        ).first()

        if permission is not None:
            return permission.role

        # Move to parent folder
        if folder.parent_id is None:
            break

        folder = db.query(Folder).filter(
            Folder.id == folder.parent_id
        ).first()

    # No permission found
    raise HTTPException(
        status_code=403,
        detail="You don't have permission to access this folder"
    )