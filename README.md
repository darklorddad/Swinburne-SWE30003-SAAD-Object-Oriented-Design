# National Parks Online System (Sarawak)

This is a web-based application for managing and visiting National Parks in Sarawak. It allows users to view park details, book tickets, and purchase merchandise. Administrators can manage parks, ticket types, merchandise, and view statistics.

## Features

- **Public Interface**:
  - View list of National Parks (Bako, Mulu, Niah, etc.)
  - View park details, ticket types, and merchandise.
  - Responsive design with animations.

- **User Features**:
  - User registration and login.
  - Profile management.
  - Book tickets and purchase merchandise.
  - View order history.
  - Reschedule bookings or request refunds.

- **Admin Dashboard**:
  - Manage Parks (Create, Update, Delete/Deactivate).
  - Manage Ticket Types and Merchandise.
  - View visitor statistics and revenue reports.

## Tech Stack

- **Backend**: Python, FastAPI
- **Database & Auth**: Supabase
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Tailwind CSS, Bootstrap 5

## Setup Instructions

1.  **Clone the repository**

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory with your Supabase credentials:
    ```
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

4.  **Run the Application**
    ```bash
    uvicorn app.main:app --reload
    ```

5.  **Access the Application**
    Open your browser and navigate to `http://127.0.0.1:8000`.

## Project Structure

- `app/`: Backend application code (API endpoints, models, services).
- `static/`: Static assets (CSS, JS).
- `templates/`: HTML templates (Jinja2).
- `assets/`: Media files (images, videos).
- `Documents/`: Project documentation and diagrams.
