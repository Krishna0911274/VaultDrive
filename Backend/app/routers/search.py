from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import get_folder_role

from app.models.user import User
from app.models.file import File
from app.models.folder import Folder


router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("/")
def search(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Remove extra spaces
    query = q.strip()

    # If search box is empty
    if not query:
        return {
            "files": [],
            "folders": []
        }

    # ==========================================
    # SEARCH FILES
    # ==========================================

    files = db.query(File).filter(
        File.name.ilike(f"%{query}%"),
        File.is_deleted == False
    ).all()

    accessible_files = []

    for file in files:

        # Root-level file
        if file.folder_id is None:

            if file.owner_id == current_user.id:
                accessible_files.append(file)

        # File inside folder
        else:

            try:
                get_folder_role(
                    file.folder_id,
                    current_user,
                    db
                )

                accessible_files.append(file)

            except Exception:
                continue


    # ==========================================
    # SEARCH FOLDERS
    # ==========================================

    folders = db.query(Folder).filter(
        Folder.name.ilike(f"%{query}%"),
        Folder.is_deleted == False
    ).all()

    accessible_folders = []

    for folder in folders:

        # Owner
        if folder.owner_id == current_user.id:

            accessible_folders.append(folder)

        else:

            try:
                get_folder_role(
                    folder.id,
                    current_user,
                    db
                )

                accessible_folders.append(folder)

            except Exception:
                continue


    # ==========================================
    # RETURN RESULTS
    # ==========================================

    return {
        "files": accessible_files,
        "folders": accessible_folders
    }