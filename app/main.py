from fastapi import FastAPI

from app.api.endpoints import auth, admin

app = FastAPI(title="SWE30003 - Assignment 3")

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(admin.router, prefix="/api", tags=["admin"])


@app.get("/")
async def root():
    """
    Root endpoint for the API.
    """
    return {"message": "Welcome to the National Parks Online System API"}
