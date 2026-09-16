from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import get_db
from app.routers.auth import router as auth_router
from app.routers.folders import router as folders_router
from app.routers import file
from app.routers import permission
from app.routers.activity import router as activity_router
from app.routers import search
from app.routers import storage


app = FastAPI(title="VaultDrive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(folders_router)
app.include_router(file.router)
app.include_router(permission.router)
app.include_router(activity_router)
app.include_router(search.router)
app.include_router(storage.router)

@app.get("/")
def root():
    return {"message": "Welcome to VaultDrive!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/health/db")
def database_health_check(
    db: Session = Depends(get_db)
):
    db.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }