from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import (hash_password, verify_password, create_access_token)
from app.schemas.user import (UserCreate,UserResponse,UserLogin,TokenResponse)
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix = "/auth",
    tags = ["Authentication"]
)

# Register User
@router.post("/register",response_model=UserResponse)
def register(user_data:UserCreate, db: Session = Depends(get_db)):
    # check email is already exist
    existing_user = (
        db.query(User).filter(User.email == user_data.email).first()
    )
    
    if existing_user:
        raise HTTPException(
            status_code = 400,
            detail = "Email already registered"
        )
    
    # Hashed Password
    hashed_password = hash_password(
        user_data.password
    )
    
    # Create User
    new_user = User(
        name = user_data.name,
        email = user_data.email,
        password_hash = hashed_password
    )
    
    # Save to Database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# Login
@router.post("/login",response_model=TokenResponse)
def login(user_data: UserLogin,db: Session = Depends(get_db)):
    user = (
        db.query(User).filter(User.email == user_data.email).first()
    )
    
    if not user:
        raise HTTPException(
            status_code = 401,
            detail = "Invalid email or password" 
        )
        
    password_correct = verify_password(
        user_data.password, user.password_hash
    )
    
    if not password_correct:
        raise HTTPException(
            status_code = 401,
            detail = "Invalid email or password"
        )
    
    access_token = create_access_token(
        {
            "sub": str(user.id)
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
    
# current User
@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user