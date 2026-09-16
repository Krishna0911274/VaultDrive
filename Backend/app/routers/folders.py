from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.dependencies.auth import get_current_user

from app.models.folder import Folder
from app.models.user import User
from app.models.file import File
from app.models.permission import Permission
from app.models.activity_log import ActivityLog

from app.schemas.folder import (
    FolderCreate,
    FolderResponse,
    FolderRename
)

from app.dependencies.permissions import get_folder_role
from app.services.activity import create_activity_log


router = APIRouter(
    prefix="/folders",
    tags=["Folders"]
)


# ============================================================
# CREATE FOLDER
# ============================================================

@router.post("/", response_model=FolderResponse)
def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If this is a subfolder, check permission on the parent folder
    if folder_data.parent_id is not None:

        parent_folder = db.query(Folder).filter(
            Folder.id == folder_data.parent_id
        ).first()

        if parent_folder is None:
            raise HTTPException(
                status_code=404,
                detail="Parent folder not found"
            )

        # Owner gets full access
        if parent_folder.owner_id == current_user.id:
            role = "owner"

        else:
            # Check permission, including inherited permission
            role = get_folder_role(
                folder_data.parent_id,
                current_user,
                db
            )

        # Viewer cannot create folders
        if role == "viewer":
            raise HTTPException(
                status_code=403,
                detail="Viewers cannot create folders"
            )

    # By default, current user owns a root folder
    folder_owner_id = current_user.id

    # If this is a subfolder,
    # the parent folder's owner remains the owner
    if folder_data.parent_id is not None:
        folder_owner_id = parent_folder.owner_id

    new_folder = Folder(
        name=folder_data.name,
        owner_id=folder_owner_id,
        parent_id=folder_data.parent_id
    )

    db.add(new_folder)
    db.flush()

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="create_folder",
        folder_id=new_folder.id
    )

    db.commit()
    db.refresh(new_folder)

    return new_folder


# ============================================================
# LIST MY FILES FOLDERS
# ============================================================

@router.get("/")
def get_folders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # My Files should show only folders owned by current user
    folders = db.query(Folder).filter(
        Folder.owner_id == current_user.id,
        Folder.is_deleted == False
    ).all()

    return folders


# ============================================================
# SHARED WITH ME
# IMPORTANT:
# This route MUST be BEFORE /{folder_id}
# ============================================================

@router.get("/shared-with-me")
def get_shared_with_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find folders that were shared with current user
    shared_folders = (
        db.query(Permission, Folder, User)
        .join(
            Folder,
            Permission.folder_id == Folder.id
        )
        .join(
            User,
            Folder.owner_id == User.id
        )
        .filter(
            Permission.user_id == current_user.id,
            Folder.is_deleted == False
        )
        .all()
    )

    result = []

    for permission, folder, owner in shared_folders:

        # Get active files inside this shared folder
        shared_files = db.query(File).filter(
            File.folder_id == folder.id,
            File.is_deleted == False
        ).all()

        result.append({
            "folder_id": folder.id,
            "folder_name": folder.name,

            "owner_id": owner.id,
            "owner_name": owner.name,
            "owner_email": owner.email,

            "role": permission.role,

            "created_at": permission.created_at,

            # Files inside shared folder
            "files": shared_files
        })

    return result


# ============================================================
# GET DELETED FOLDERS / TRASH
# ============================================================

@router.get("/trash")
def get_deleted_folders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folders = db.query(Folder).filter(
        Folder.owner_id == current_user.id,
        Folder.is_deleted == True
    ).order_by(
        Folder.deleted_at.desc()
    ).all()

    return folders


# ============================================================
# RESTORE FOLDER
# ============================================================

@router.put("/{folder_id}/restore")
def restore_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id,
        Folder.is_deleted == True
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Deleted folder not found"
        )

    folder.is_deleted = False
    folder.deleted_at = None

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="restore_folder",
        folder_id=folder.id
    )

    db.commit()
    db.refresh(folder)

    return {
        "message": "Folder restored successfully"
    }


# ============================================================
# PERMANENTLY DELETE FOLDER
# ============================================================

@router.delete("/{folder_id}/permanent")
def permanently_delete_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id,
        Folder.is_deleted == True
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Deleted folder not found"
        )

    # Remove permissions related to this folder
    db.query(Permission).filter(
        Permission.folder_id == folder.id
    ).delete(
        synchronize_session=False
    )

    # Remove activity logs related to this folder
    db.query(ActivityLog).filter(
        ActivityLog.folder_id == folder.id
    ).delete(
        synchronize_session=False
    )

    # Finally delete the folder
    db.delete(folder)

    db.commit()

    return {
        "message": "Folder permanently deleted"
    }


# ============================================================
# GET SINGLE FOLDER
# ============================================================

@router.get("/{folder_id}", response_model=FolderResponse)
def get_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = (
        db.query(Folder)
        .filter(
            Folder.id == folder_id
        )
        .first()
    )

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # Owner can access
    if folder.owner_id == current_user.id:
        return folder

    # Check shared permission
    permission = (
        db.query(Permission)
        .filter(
            Permission.user_id == current_user.id,
            Permission.folder_id == folder_id
        )
        .first()
    )

    if permission is None:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this folder"
        )

    return folder


# ============================================================
# UPDATE FOLDER
# ============================================================

@router.put(
    "/{folder_id}",
    response_model=FolderResponse
)
def update_folder(
    folder_id: int,
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = (
        db.query(Folder)
        .filter(
            Folder.id == folder_id,
            Folder.owner_id == current_user.id
        )
        .first()
    )

    if not folder:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    folder.name = folder_data.name

    db.commit()
    db.refresh(folder)

    return folder


# ============================================================
# RENAME FOLDER
# ============================================================

@router.put(
    "/{folder_id}/rename",
    response_model=FolderResponse
)
def rename_folder(
    folder_id: int,
    folder_data: FolderRename,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    if folder.owner_id == current_user.id:
        role = "owner"

    else:
        role = get_folder_role(
            folder_id,
            current_user,
            db
        )

    # Viewer cannot rename
    if role == "viewer":
        raise HTTPException(
            status_code=403,
            detail="Viewers cannot rename folders"
        )

    new_name = folder_data.name.strip()

    if not new_name:
        raise HTTPException(
            status_code=400,
            detail="Folder name cannot be empty"
        )

    folder.name = new_name

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="rename_folder",
        folder_id=folder.id
    )

    db.commit()
    db.refresh(folder)

    return folder


# ============================================================
# DELETE FOLDER - MOVE TO TRASH
# ============================================================

@router.delete("/{folder_id}")
def delete_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Find the folder
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.is_deleted == False
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 2. Only owner can delete
    if folder.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the folder owner can delete this folder"
        )

    # ---------------------------------------------------------
    # Recursive function to move folder contents to Trash
    # ---------------------------------------------------------

    def move_folder_to_trash(folder_id: int):

        # Find active files inside this folder
        files = db.query(File).filter(
            File.folder_id == folder_id,
            File.is_deleted == False
        ).all()

        for file in files:
            file.is_deleted = True
            file.deleted_at = datetime.utcnow()

            create_activity_log(
                db=db,
                user_id=current_user.id,
                action="delete_file",
                file_id=file.id
            )

        # Find active subfolders
        subfolders = db.query(Folder).filter(
            Folder.parent_id == folder_id,
            Folder.is_deleted == False
        ).all()

        for subfolder in subfolders:

            # Recursively delete its contents
            move_folder_to_trash(subfolder.id)

            # Move subfolder to Trash
            subfolder.is_deleted = True
            subfolder.deleted_at = datetime.utcnow()

            create_activity_log(
                db=db,
                user_id=current_user.id,
                action="delete_folder",
                folder_id=subfolder.id
            )

    # ---------------------------------------------------------
    # Move everything inside the main folder to Trash
    # ---------------------------------------------------------

    move_folder_to_trash(folder.id)

    # ---------------------------------------------------------
    # Move main folder to Trash
    # ---------------------------------------------------------

    folder.is_deleted = True
    folder.deleted_at = datetime.utcnow()

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="delete_folder",
        folder_id=folder.id
    )

    db.commit()
    db.refresh(folder)

    return {
        "message": "Folder and its contents moved to Trash successfully"
    }
# ============================================================
# GET FOLDER CONTENTS
# ============================================================

@router.get("/{folder_id}/contents")
def get_folder_contents(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Find folder
    folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 2. Check permission
    get_folder_role(
        folder_id,
        current_user,
        db
    )

    # 3. Find subfolders
    subfolders = db.query(Folder).filter(
        Folder.parent_id == folder_id
    ).all()

    # 4. Find active files
    files = db.query(File).filter(
        File.folder_id == folder_id,
        File.is_deleted == False
    ).all()

    # 5. Return everything
    return {
        "folder": folder,
        "folders": subfolders,
        "files": files
    }


# ============================================================
# GET FOLDER ROLE
# ============================================================

@router.get("/{folder_id}/role")
def get_my_folder_role(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    role = get_folder_role(
        folder_id,
        current_user,
        db
    )

    return {
        "folder_id": folder_id,
        "role": role
    }