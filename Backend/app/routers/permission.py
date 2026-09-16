from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user

from app.models.user import User
from app.models.folder import Folder
from app.models.permission import Permission
from app.services.activity import create_activity_log

from app.schemas.permission import (
    PermissionCreate,
    PermissionResponse,
    PermissionUpdate,
)


router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"]
)


@router.post(
    "/share",
    response_model=PermissionResponse
)
def share_folder(
    permission_data: PermissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # 1. Check that current user owns the folder
    folder = (
        db.query(Folder)
        .filter(
            Folder.id == permission_data.folder_id,
            Folder.owner_id == current_user.id
        )
        .first()
    )

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 2. Find the user we want to share with
    user = (
        db.query(User)
        .filter(
            User.email == permission_data.email
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # 3. Owner cannot be given a permission record
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You are already the owner of this folder"
        )

    # 4. Check existing permission
    existing_permission = (
        db.query(Permission)
        .filter(
            Permission.user_id == user.id,
            Permission.folder_id == folder.id
        )
        .first()
    )

    if existing_permission is not None:
        # Update existing role
        existing_permission.role = permission_data.role
        
        create_activity_log(
            db=db,
            user_id=current_user.id,
            action="update_permission",
            folder_id=folder.id
        )

        db.commit()
        db.refresh(existing_permission)

        return existing_permission

    # 5. Create new permission
    new_permission = Permission(
        user_id=user.id,
        folder_id=folder.id,
        role=permission_data.role
    )

    db.add(new_permission)
    
    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="share",
        folder_id=folder.id
    )

    db.commit()
    db.refresh(new_permission)

    return new_permission

# Get all users who have access to a folder
@router.get("/folder/{folder_id}")
def get_folder_permissions(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check that the folder belongs to the current user
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 2. Get all permissions for this folder
    permissions = db.query(Permission).filter(
        Permission.folder_id == folder_id
    ).all()

    # 3. Prepare response
    result = []

    for permission in permissions:
        user = db.query(User).filter(
            User.id == permission.user_id
        ).first()

        result.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": permission.role
        })

    return result

# Change a user's role for a folder
@router.put("/folder/{folder_id}/user/{user_id}")
def update_folder_permission(
    folder_id: int,
    user_id: int,
    permission_data: PermissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check that the current user owns the folder
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 3. Find the existing permission
    permission = db.query(Permission).filter(
        Permission.folder_id == folder_id,
        Permission.user_id == user_id
    ).first()

    if permission is None:
        raise HTTPException(
            status_code=404,
            detail="Permission not found"
        )

    # 4. Change the role
    permission.role = permission_data.role
    
    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="update_permission",
        folder_id=folder.id
    )

    db.commit()
    db.refresh(permission)

    return {
        "message": "Permission updated successfully",
        "user_id": permission.user_id,
        "folder_id": permission.folder_id,
        "role": permission.role
    }
    
# Remove a user's access from a folder
@router.delete("/folder/{folder_id}/user/{user_id}")
def remove_folder_permission(
    folder_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check that the current user owns the folder
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 2. Find the permission
    permission = db.query(Permission).filter(
        Permission.folder_id == folder_id,
        Permission.user_id == user_id
    ).first()

    if permission is None:
        raise HTTPException(
            status_code=404,
            detail="Permission not found"
        )

    # 3. Delete the permission
    db.delete(permission)
    
    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="remove_permission",
        folder_id=folder.id
    )
    
    db.commit()

    return {
        "message": "User access removed successfully"
    }