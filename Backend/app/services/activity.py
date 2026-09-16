from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


def create_activity_log(
    db: Session,
    user_id: int,
    action: str,
    file_id: int | None = None,
    folder_id: int | None = None
):
    activity = ActivityLog(
        user_id=user_id,
        action=action,
        file_id=file_id,
        folder_id=folder_id
    )

    db.add(activity)