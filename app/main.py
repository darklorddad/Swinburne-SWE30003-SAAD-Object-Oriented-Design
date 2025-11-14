from fastapi import FastAPI

app = FastAPI(title="SWE30003 - Assignment 3")


@app.get("/")
async def root():
    """
    Root endpoint for the API.
    """
    return {"message": "Welcome to the National Parks Online System API"}
