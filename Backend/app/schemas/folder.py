from datetime import datetime

from pydantic import BaseModel


class FolderCreate(BaseModel):
    name: str
    parent_id: int | None = None
    
class FolderRename(BaseModel):
    name: str

class FolderResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    parent_id: int | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
    
class FolderItemResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    parent_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FolderContentsResponse(BaseModel):
    folder: FolderResponse
    folders: list[FolderItemResponse]
    files: list
    
