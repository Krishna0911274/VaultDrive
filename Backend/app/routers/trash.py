from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.file import File
from app.models.user import User
from app.models.stored_object import StoredObject
from app.core.dependencies import get_current_user
from app.services.activity import create_activity_log

router = APIRouter(
    prefix="/trash",
    tags=["Trash"]
)

@router.get("/")
def get_trash(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(
        File.owner_id == current_user.id,
        File.deleted_at.is_not(None)
    ).order_by(
        File.deleted_at.desc()
    ).all()

    return files

@router.put("/{file_id}/restore")
def restore_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id,
        File.deleted_at.is_not(None)
    ).first()

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found in trash"
        )

    file.deleted_at = None

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="restore_file",
        file_id=file.id
    )

    db.commit()
    db.refresh(file)

    return {
        "message": "File restored successfully",
        "file": file
    }
    
@router.delete("/{file_id}/permanent")
def permanently_delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id,
        File.deleted_at.is_not(None)
    ).first()

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found in trash"
        )

    stored_object = db.query(StoredObject).filter(
        StoredObject.id == file.stored_object_id
    ).first()

    stored_object_id = file.stored_object_id

    # Delete the File reference
    db.delete(file)
    db.flush()

    # Check whether another File is using the same StoredObject
    remaining_reference = db.query(File).filter(
        File.stored_object_id == stored_object_id
    ).first()

    if remaining_reference is None and stored_object is not None:

        storage_path = stored_object.storage_path

        db.delete(stored_object)

        db.commit()

        # Delete physical file
        import os

        if os.path.exists(storage_path):
            os.remove(storage_path)

    else:
        db.commit()

    return {
        "message": "File permanently deleted"
    }