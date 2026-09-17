import hashlib
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File as FastAPIFile,
    UploadFile,
    HTTPException,
    Form,
    Response,
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.auth import get_current_user
from app.dependencies.permissions import get_folder_role

from app.models.user import User
from app.models.file import File
from app.models.folder import Folder
from app.models.stored_object import StoredObject

from app.services.activity import create_activity_log

from app.schemas.file import FileResponse, FileRename

from app.services.s3 import (
    upload_to_s3,
    get_from_s3,
    delete_from_s3,
)

from datetime import datetime


router = APIRouter(
    prefix="/files",
    tags=["Files"],
)


# ============================================================
# SETTINGS
# ============================================================

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
    ".mp4",
    ".webm",
    ".mov",
    ".mkv",
    ".avi",
    ".gif",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
}


# ============================================================
# UPLOAD FILE
# ============================================================

@router.post(
    "/upload",
    response_model=FileResponse,
)
async def upload_file(
    file: UploadFile = FastAPIFile(...),

    # IMPORTANT:
    # React sends folder_id using FormData.
    folder_id: int | None = Form(None),

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db),
):

    # ========================================================
    # 1. CHECK FOLDER
    # ========================================================

    folder = None

    if folder_id is not None:

        folder = (
            db.query(Folder)
            .filter(Folder.id == folder_id)
            .first()
        )

        if folder is None:
            raise HTTPException(
                status_code=404,
                detail="Folder not found",
            )

        # ----------------------------------------------------
        # OWNER
        # ----------------------------------------------------

        if folder.owner_id == current_user.id:

            role = "owner"

        else:

            # ------------------------------------------------
            # EDITOR / VIEWER
            # ------------------------------------------------

            role = get_folder_role(
                folder_id,
                current_user,
                db,
            )

        # ----------------------------------------------------
        # VIEWER CANNOT UPLOAD
        # ----------------------------------------------------

        if role == "viewer":

            raise HTTPException(
                status_code=403,
                detail="Viewers cannot upload files",
            )


    # ========================================================
    # 2. READ FILE
    # ========================================================

    file_content = await file.read()


    # ========================================================
    # 3. EMPTY FILE CHECK
    # ========================================================

    if not file_content:

        raise HTTPException(
            status_code=400,
            detail="File cannot be empty",
        )


    # ========================================================
    # 4. FILE SIZE CHECK
    # ========================================================

    if len(file_content) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 10 MB",
        )


    # ========================================================
    # 5. SAFE FILE NAME
    # ========================================================

    original_filename = file.filename or "unknown"

    safe_filename = Path(original_filename).name

    file_extension = Path(
        safe_filename
    ).suffix.lower()


    # ========================================================
    # 6. FILE TYPE CHECK
    # ========================================================

    if file_extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                f"File type '{file_extension}' "
                "is not allowed"
            ),
        )


    # ========================================================
    # 7. SHA-256 HASH
    # ========================================================

    file_hash = hashlib.sha256(
        file_content
    ).hexdigest()


    # ========================================================
    # 8. FIND EXISTING STORED OBJECT
    #
    # Deduplication happens here.
    #
    # Same file content = same SHA-256 hash
    #
    # Therefore we reuse the physical file.
    # ========================================================

    stored_object = (
        db.query(StoredObject)
        .filter(
            StoredObject.file_hash == file_hash
        )
        .first()
    )


    # ========================================================
    # 9. CREATE STORED OBJECT IF NEEDED
    # ========================================================

    if stored_object is None:

        # File content does not exist in S3 yet.
        # Upload it and create a new StoredObject.

        storage_path = upload_to_s3(
            file_content=file_content,
            file_hash=file_hash,
            content_type=file.content_type,
        )

        stored_object = StoredObject(
            file_hash=file_hash,
            file_size=len(file_content),
            storage_path=storage_path,
        )

        db.add(stored_object)

        db.flush()

    else:

    # Same file content already exists.
    # Reuse the existing StoredObject.
    #
    # We do NOT upload the file again.
    # We do NOT create another StoredObject.

        pass

    # ========================================================
    # 10. CHECK DUPLICATE FILE IN SAME FOLDER
    #
    # IMPORTANT:
    #
    # We ignore deleted files.
    #
    # This means:
    #
    # Delete abc.jpg
    # ↓
    # Upload abc.jpg again
    #
    # is allowed.
    # ========================================================

    existing_file_query = (
        db.query(File)
        .filter(
            File.folder_id == folder_id,

            File.stored_object_id
            == stored_object.id,

            File.is_deleted == False,
        )
    )


    # Root-level file:
    # only compare against current user's root files.

    if folder_id is None:

        existing_file_query = (
            existing_file_query
            .filter(
                File.owner_id
                == current_user.id
            )
        )


    existing_file = (
        existing_file_query
        .first()
    )


    if existing_file is not None:

        raise HTTPException(
            status_code=400,
            detail=(
                "This file already exists "
                "in this folder."
            ),
        )


    # ========================================================
    # 11. FILE OWNER
    #
    # If uploaded into someone's folder,
    # folder owner becomes file owner.
    #
    # Root upload belongs to current user.
    # ========================================================

    if folder is not None:

        file_owner_id = folder.owner_id

    else:

        file_owner_id = current_user.id


    # ========================================================
    # 12. CREATE FILE REFERENCE
    #
    # THIS IS THE IMPORTANT PART FOR FOLDER UPLOAD.
    #
    # folder_id is stored here.
    # ========================================================

    new_file = File(
        name=safe_filename,

        owner_id=file_owner_id,

        folder_id=folder_id,

        stored_object_id=stored_object.id,

        file_size=stored_object.file_size,

        is_deleted=False,

        deleted_at=None,
    )


    db.add(new_file)

    db.flush()


    # ========================================================
    # 13. ACTIVITY LOG
    # ========================================================

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="upload",
        file_id=new_file.id,
        folder_id=folder_id,
    )


    # ========================================================
    # 14. COMMIT
    # ========================================================

    db.commit()


    # ========================================================
    # 15. REFRESH
    # ========================================================

    db.refresh(new_file)


    return new_file


# ============================================================
# GET ALL FILES
# ============================================================

@router.get("/")
def get_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(
        File.is_deleted == False
    ).all()

    result = []

    for file in files:

        if file.folder_id is not None:

            try:
                get_folder_role(
                    file.folder_id,
                    current_user,
                    db
                )

                result.append(file)

            except HTTPException:
                continue

        else:

            if file.owner_id == current_user.id:
                result.append(file)

    return result

# ============================================================
# DOWNLOAD FILE
# ============================================================

@router.get("/{file_id}/download")
def download_file(
    file_id: int,

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db),
):

    # ========================================================
    # 1. FIND FILE
    # ========================================================

    file = (
        db.query(File)
        .filter(
            File.id == file_id,

            # Deleted files cannot be downloaded.
            File.is_deleted == False,
        )
        .first()
    )


    if file is None:

        raise HTTPException(
            status_code=404,
            detail="File not found",
        )


    # ========================================================
    # 2. PERMISSION
    # ========================================================

    if file.folder_id is not None:

        get_folder_role(
            file.folder_id,
            current_user,
            db,
        )

    else:

        if file.owner_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You don't have permission "
                    "to download this file"
                ),
            )


    # ========================================================
    # 3. STORED OBJECT
    # ========================================================

    stored_object = (
        db.query(StoredObject)
        .filter(
            StoredObject.id
            == file.stored_object_id
        )
        .first()
    )


    if stored_object is None:

        raise HTTPException(
            status_code=404,
            detail="Stored file not found",
        )


    # ========================================================
    # 4. GET FILE FROM S3
    # ========================================================

    file_content = get_from_s3(
    	stored_object.storage_path
    )


    # ========================================================
    # 5. RETURN FILE
    # ========================================================

    return Response(
        content=file_content,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{file.name}"'
        }
    )

# ============================================================
# PREVIEW FILE
# ============================================================

@router.get("/{file_id}/preview")
def preview_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.is_deleted == False
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Check access
    if file.folder_id is not None:
        get_folder_role(
            file.folder_id,
            current_user,
            db
        )
    else:
        if file.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

    stored_object = db.query(StoredObject).filter(
        StoredObject.id == file.stored_object_id
    ).first()

    if not stored_object:
        raise HTTPException(
            status_code=404,
            detail="Stored object not found"
        )

    file_content = get_from_s3(
    	stored_object.storage_path
    )


    extension = file.name.lower().split(".")[-1]

    media_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",

        "mp4": "video/mp4",
        "webm": "video/webm",
        "mov": "video/quicktime",
        "mkv": "video/x-matroska",
        "avi": "video/x-msvideo",

        "pdf": "application/pdf",

        "txt": "text/plain",
    }

    media_type = media_types.get(
        extension,
        "application/octet-stream"
    )

    return Response(
        content=file_content,
        media_type=media_type,
        headers={
            "Content-Disposition": "inline"
        }
    )
# ============================================================
# SOFT DELETE FILE
# ============================================================

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.is_deleted == False
    ).first()

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    if file.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the file owner can delete this file"
        )

    # Already in trash
    if file.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="File is already in Trash"
        )

    # Soft delete
    file.is_deleted = True
    file.deleted_at = datetime.utcnow()

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="delete_file",
        file_id=file.id,
        folder_id=file.folder_id
    )

    db.commit()
    db.refresh(file)

    return {
        "message": "File moved to Trash successfully"
    }
# ============================================================
# GET TRASH
# ============================================================

@router.get("/trash")
def get_trash(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(
        File.owner_id == current_user.id,
        File.is_deleted == True
    ).order_by(
        File.deleted_at.desc()
    ).all()

    return files

# ============================================================
# RESTORE FILE
# ============================================================

@router.put("/{file_id}/restore")
def restore_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id
    ).first()

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    if file.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to restore this file"
        )

    if not file.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="File is not in Trash"
        )

    # Restore
    file.is_deleted = False
    file.deleted_at = None

    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="restore_file",
        file_id=file.id,
        folder_id=file.folder_id
    )

    db.commit()
    db.refresh(file)

    return {
        "message": "File restored successfully",
        "file": file
    }

# ============================================================
# PERMANENT DELETE
# ============================================================

@router.delete("/{file_id}/permanent")
def permanently_delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id
    ).first()

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    if file.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to permanently delete this file"
        )

    if not file.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="File must be in Trash before permanent deletion"
        )

    stored_object = db.query(StoredObject).filter(
        StoredObject.id == file.stored_object_id
    ).first()

    db.delete(file)
    db.flush()

    if stored_object:

        remaining_files = db.query(File).filter(
            File.stored_object_id == stored_object.id
        ).count()

        if remaining_files == 0:

            delete_from_s3(
            stored_object.storage_path
        )

            db.delete(stored_object)

    db.commit()

    return {
        "message": "File permanently deleted"
    }
# ============================================================
# RENAME FILE
# ============================================================

@router.put(
    "/{file_id}/rename",
    response_model=FileResponse,
)
def rename_file(
    file_id: int,

    file_data: FileRename,

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db),
):

    file = (
        db.query(File)
        .filter(
            File.id == file_id,

            File.is_deleted == False,
        )
        .first()
    )


    if file is None:

        raise HTTPException(
            status_code=404,
            detail="File not found",
        )


    # ========================================================
    # CHECK PERMISSION
    # ========================================================

    if file.folder_id is not None:

        role = get_folder_role(
            file.folder_id,
            current_user,
            db,
        )

    else:

        if file.owner_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You don't have permission "
                    "to rename this file"
                ),
            )

        role = "owner"


    if role == "viewer":

        raise HTTPException(
            status_code=403,
            detail="Viewers cannot rename files",
        )


    # ========================================================
    # VALIDATE NAME
    # ========================================================

    new_name = file_data.name.strip()


    if not new_name:

        raise HTTPException(
            status_code=400,
            detail="File name cannot be empty",
        )


    new_name = Path(new_name).name


    file.name = new_name


    create_activity_log(
        db=db,

        user_id=current_user.id,

        action="rename",

        file_id=file.id,

        folder_id=file.folder_id,
    )


    db.commit()

    db.refresh(file)


    return file


# ============================================================
# GET FILES INSIDE FOLDER
# ============================================================

@router.get("/folder/{folder_id}")
def get_files_by_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check that folder exists
    folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if folder is None:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # 2. Check user's permission
    get_folder_role(
        folder_id,
        current_user,
        db
    )

    # 3. IMPORTANT:
    # Return ONLY files that are NOT in Trash
    files = db.query(File).filter(
        File.folder_id == folder_id,
        File.is_deleted == False
    ).all()

    return files
