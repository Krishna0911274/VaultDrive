from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.activity import ActivityResponse
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.models.file import File
from app.models.folder import Folder


router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)


@router.get("/", response_model=list[ActivityResponse])
def get_my_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(
        ActivityLog.created_at.desc()
    ).all()

    result = []

    for activity in activities:

        result.append({
            "id": activity.id,
            "user_name": activity.user.name,
            "action": activity.action,
            "file_name": activity.file.name if activity.file else None,
            "folder_name": activity.folder.name if activity.folder else None,
            "created_at": activity.created_at
        })

    return result