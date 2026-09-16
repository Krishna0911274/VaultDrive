from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user

from app.models.user import User
from app.models.file import File
from app.models.stored_object import StoredObject


router = APIRouter(
    prefix="/storage",
    tags=["Storage"]
)


# ============================================================
# STORAGE SETTINGS
# ============================================================

STORAGE_LIMIT_GB = 10

STORAGE_LIMIT_BYTES = (
    STORAGE_LIMIT_GB
    * 1024
    * 1024
    * 1024
)


# ============================================================
# GET STORAGE USAGE
# ============================================================

@router.get("/")
def get_storage_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Get all active files owned by current user
    # --------------------------------------------------------

    files = db.query(File).filter(
        File.owner_id == current_user.id,
        File.is_deleted == False
    ).all()


    # --------------------------------------------------------
    # Get unique StoredObject IDs
    #
    # This is important for deduplication.
    # --------------------------------------------------------

    stored_object_ids = set()

    for file in files:
        stored_object_ids.add(
            file.stored_object_id
        )


    # --------------------------------------------------------
    # Calculate actual physical storage
    # --------------------------------------------------------

    used_bytes = 0

    if stored_object_ids:

        stored_objects = db.query(
            StoredObject
        ).filter(
            StoredObject.id.in_(
                stored_object_ids
            )
        ).all()

        for stored_object in stored_objects:
            used_bytes += stored_object.file_size


    # --------------------------------------------------------
    # Remaining storage
    # --------------------------------------------------------

    remaining_bytes = max(
        STORAGE_LIMIT_BYTES - used_bytes,
        0
    )


    # --------------------------------------------------------
    # Percentage used
    # --------------------------------------------------------

    percentage = (
        used_bytes / STORAGE_LIMIT_BYTES
    ) * 100


    # --------------------------------------------------------
    # Return storage information
    # --------------------------------------------------------

    return {
        "used_bytes": used_bytes,

        "used_mb": round(
            used_bytes / (1024 * 1024),
            2
        ),

        "used_gb": round(
            used_bytes / (1024 * 1024 * 1024),
            2
        ),

        "limit_bytes": STORAGE_LIMIT_BYTES,

        "limit_gb": STORAGE_LIMIT_GB,

        "remaining_bytes": remaining_bytes,

        "remaining_gb": round(
            remaining_bytes / (1024 * 1024 * 1024),
            2
        ),

        "percentage": round(
            percentage,
            2
        )
    }