# Athlete Performance and Injury Tracking System (APITS)

**BCA Final Year Project**

A full-stack web application for managing athlete performance metrics, injury tracking, competitions, attendance, and weight monitoring.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Bootstrap 5       |
| Backend    | Django 4.2 + Django REST Framework  |
| Database   | MySQL 8.0                           |
| Charts     | Chart.js + react-chartjs-2          |
| Reports    | ReportLab (PDF) + OpenPyXL (Excel)  |

## Features

1. **Admin Authentication** — Login, Logout, Session Management
2. **Athlete Management** — Add, Edit, Delete, Search, View Profile
3. **Performance Tracking** — Speed, Strength, Endurance, Flexibility, Agility + Dashboard
4. **Injury Tracking** — Add Injury, Update Recovery, Medical Notes, History
5. **Competition Management** — Add Competitions, Store Results, Medal Tracking
6. **Attendance Tracking** — Bulk Mark Attendance, Reports with Statistics
7. **Weight Monitoring** — Weight Tracking, BMI Calculator, Body Fat %
8. **Dashboard** — Statistics + Chart.js Graphs
9. **Reports** — PDF Generation + Excel Export

## Project Structure

```
athlete-performance-system/
├── backend/                    # Django REST API
│   ├── athlete_system/         # Django project settings
│   ├── api/                    # Main API app
│   │   ├── models.py           # Database models
│   │   ├── views.py            # API endpoints
│   │   ├── serializers.py      # Data serializers
│   │   ├── reports.py          # PDF/Excel generation
│   │   └── management/         # Custom commands
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Layout, Sidebar, Navbar
│   │   ├── pages/              # All page components
│   │   ├── services/api.js     # API service layer
│   │   ├── context/            # Auth context
│   │   └── styles/App.css      # Custom styles
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql              # MySQL schema
│   └── sample_data.sql         # Sample data
├── docs/
│   ├── INSTALLATION.md         # Setup guide
│   └── PROJECT_DOCUMENTATION.md
└── README.md
```

## Database Tables

| Table                | Description                              |
|----------------------|------------------------------------------|
| `auth_user` (users)  | Admin authentication (Django built-in)   |
| `athletes`           | Athlete profiles                         |
| `performance`        | Performance metrics                      |
| `injuries`           | Injury records                           |
| `competitions`       | Competition events                       |
| `competition_results`| Results and medals                       |
| `attendance`         | Attendance records                       |
| `weight_tracking`    | Weight, BMI, body fat records            |

## Quick Start (Windows)

**Project path:** `C:\BCA_Project\athlete-performance-system`

### One-time setup
Double-click **`setup.bat`** or run manually:

```cmd
cd C:\BCA_Project\athlete-performance-system\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_admin
python manage.py seed_data

cd ..\frontend
npm install
```

### Run every time (2 terminals)

**Terminal 1 - Backend:**
```cmd
cd C:\BCA_Project\athlete-performance-system\backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```cmd
cd C:\BCA_Project\athlete-performance-system\frontend
npm start
```

Open **http://localhost:5173** — Login: `admin` / `admin123`

See **[RUN_INSTRUCTIONS.md](RUN_INSTRUCTIONS.md)** for full Windows guide.

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/auth/login/`              | Admin login              |
| POST   | `/api/auth/logout/`             | Admin logout             |
| GET    | `/api/dashboard/stats/`         | Dashboard statistics     |
| CRUD   | `/api/athletes/`                | Athlete management       |
| CRUD   | `/api/performance/`           | Performance records      |
| CRUD   | `/api/injuries/`                | Injury records           |
| CRUD   | `/api/competitions/`            | Competitions             |
| CRUD   | `/api/attendance/`              | Attendance               |
| CRUD   | `/api/weight-tracking/`         | Weight tracking          |
| GET    | `/api/reports/pdf/?type=`       | Download PDF report      |
| GET    | `/api/reports/excel/?type=`     | Download Excel export    |

## Viva Preparation

Key topics to explain:
- **Architecture:** React SPA → Django REST API → MySQL
- **Authentication:** Django session-based auth with CSRF protection
- **BMI Calculation:** `BMI = weight(kg) / height(m)²`
- **CRUD Operations:** RESTful API with ViewSets
- **Charts:** Chart.js integration for dashboard visualization
- **Reports:** Server-side PDF (ReportLab) and Excel (OpenPyXL) generation