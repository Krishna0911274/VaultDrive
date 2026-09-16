from typing import Literal

from pydantic import BaseModel, EmailStr


class PermissionCreate(BaseModel):
    email: EmailStr
    folder_id: int
    role: Literal["editor", "viewer"]
    
class PermissionUpdate(BaseModel):
    role: Literal["editor", "viewer"]

class PermissionResponse(BaseModel):
    id: int
    user_id: int
    folder_id: int
    role: str

    model_config = {"from_attributes": True}