from uuid import UUID

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.endpoints import admin, auth, orders, parks

app = FastAPI(title="SWE30003 - Assignment 3")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="templates")


# Include API routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(orders.router, prefix="/api", tags=["orders"])
app.include_router(parks.router, prefix="/api", tags=["parks"])


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """
    Serves the root HTML page.
    """
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """
    Serves the login page.
    """
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """
    Serves the registration page.
    """
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    """
    Serves the user profile page.
    """
    return templates.TemplateResponse("profile.html", {"request": request})


@app.get("/parks/{park_id}", response_class=HTMLResponse)
async def park_detail_page(request: Request, park_id: UUID):
    """
    Serves the park detail page.
    """
    return templates.TemplateResponse(
        "park_detail.html", {"request": request, "park_id": park_id}
    )


@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard_page(request: Request):
    """
    Serves the admin dashboard page.
    """
    return templates.TemplateResponse("admin.html", {"request": request})
