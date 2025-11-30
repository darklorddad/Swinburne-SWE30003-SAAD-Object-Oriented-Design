# National Parks Booking System

This project is a web application for the National Parks Marketing Company, developed by Swin Consulting. It allows customers to browse national parks, purchase tickets and merchandise, and manage their orders. It also provides an admin dashboard for managing parks, products, and viewing statistics.

## Features

-   **User Authentication**: Sign up, login, password recovery, and profile management.
-   **Park Browsing**: View details of various national parks.
-   **Ticketing & Merchandise**: Purchase entry tickets and merchandise for specific parks.
-   **Order Management**: Customers can view, cancel, reschedule, and request refunds for their orders.
-   **Admin Dashboard**:
    -   Manage parks (add, update, delete).
    -   Manage ticket types and merchandise.
    -   View visitor statistics.

## Tech Stack

-   **Backend**: Python, FastAPI
-   **Database**: Supabase (PostgreSQL)
-   **Frontend**: HTML, CSS, JavaScript (Vanilla), Jinja2 Templates
-   **Authentication**: OAuth2 with Password Flow

## Setup

1.  Install dependencies:
    ```bash
    pip install fastapi uvicorn[standard] supabase
    ```
2.  Configure environment variables (e.g., `SUPABASE_URL`, `SUPABASE_KEY`).
3.  Run the application:
    ```bash
    uvicorn app.main:app --reload
    ```
