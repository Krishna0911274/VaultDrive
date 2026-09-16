from datetime import datetime
from pydantic import BaseModel

class FileResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    folder_id: int | None
    stored_object_id: int
    file_size: int
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }
    
class FileRename(BaseModel):
    name: str