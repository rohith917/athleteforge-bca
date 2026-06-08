# Installation Guide

## Athlete Performance and Injury Tracking System

### Prerequisites

Install the following software before starting:

| Software   | Version  | Download                                      |
|------------|----------|-----------------------------------------------|
| Python     | 3.10+    | https://www.python.org/downloads/             |
| Node.js    | 18+      | https://nodejs.org/                           |
| MySQL      | 8.0+     | https://dev.mysql.com/downloads/installer/    |
| Git        | Latest   | https://git-scm.com/downloads (optional)      |

---

## Step 1: MySQL Database Setup

### 1.1 Start MySQL Server

Open MySQL Workbench or command line and ensure MySQL is running.

### 1.2 Create Database and Tables

```bash
# Open MySQL command line
mysql -u root -p

# Run schema (creates database and tables)
source C:/Users/jayat.ROHITH/athlete-performance-system/database/schema.sql

# Load sample data (optional)
source C:/Users/jayat.ROHITH/athlete-performance-system/database/sample_data.sql
```

Or from command prompt:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample_data.sql
```

---

## Step 2: Django Backend Setup

### 2.1 Navigate to Backend

```bash
cd athlete-performance-system/backend
```

### 2.2 Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

> **Note:** If `mysqlclient` fails to install on Windows, install [MySQL Connector/C](https://dev.mysql.com/downloads/connector/c/) first, or use:
> ```bash
> pip install pymysql
> ```
> Then add to `athlete_system/__init__.py`:
> ```python
> import pymysql
> pymysql.install_as_MySQLdb()
> ```

### 2.4 Configure Environment

```bash
copy .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=athlete_tracking_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

### 2.5 Run Migrations

```bash
python manage.py migrate
```

### 2.6 Create Admin User

```bash
python manage.py setup_admin
```

Default credentials: **admin** / **admin123**

### 2.7 Start Backend Server

```bash
python manage.py runserver
```

Backend runs at: http://localhost:8000

---

## Step 3: React Frontend Setup

### 3.1 Navigate to Frontend

Open a new terminal:

```bash
cd athlete-performance-system/frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

> **Windows PowerShell issue:** If npm scripts are blocked, run:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
> Or use: `cmd /c npm install`

### 3.3 Start Development Server

```bash
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Step 4: Access the Application

1. Open browser: http://localhost:5173
2. Login with: **admin** / **admin123**
3. Explore all modules from the sidebar

---

## Troubleshooting

### MySQL Connection Error

- Verify MySQL service is running
- Check username/password in `.env`
- Ensure database `athlete_tracking_db` exists

### CORS Error

- Ensure backend is running on port 8000
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`

### CSRF Token Error

- Frontend must use `withCredentials: true` (already configured)
- Access app via http://localhost:5173 (not file://)

### npm Execution Policy (Windows)

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Port Already in Use

```bash
# Django - use different port
python manage.py runserver 8001

# React - edit vite.config.js server.port
```

---

## Production Deployment (Optional)

```bash
# Build React for production
cd frontend
npm run build

# Collect Django static files
cd ../backend
python manage.py collectstatic

# Use gunicorn for production
pip install gunicorn
gunicorn athlete_system.wsgi:application
```

Set `DEBUG=False` in `.env` for production.