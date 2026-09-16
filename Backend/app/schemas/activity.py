from datetime import datetime

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: int
    user_name: str
    action: str
    file_name: str | None
    folder_name: str | None
    created_at: datetime