# How to Run - Windows Step by Step

**Project Location:** `C:\BCA_Project\athlete-performance-system`

---

## First Time Setup (run once)

### Option A: Automatic (Recommended)

1. Open File Explorer → go to `C:\BCA_Project\athlete-performance-system`
2. Double-click **`setup.bat`**
3. Wait until you see "SETUP COMPLETE!"

### Option B: Manual Commands

Open **Command Prompt** or **PowerShell**:

```cmd
cd C:\BCA_Project\athlete-performance-system\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_admin
python manage.py seed_data
```

Then frontend:

```cmd
cd C:\BCA_Project\athlete-performance-system\frontend
npm install
```

---

## Every Time You Run the Project

You need **TWO terminals** (backend + frontend).

### Terminal 1 - Backend (Django)

```cmd
cd C:\BCA_Project\athlete-performance-system\backend
venv\Scripts\activate
python manage.py runserver
```

Or double-click: **`run-backend.bat`**

Backend runs at: **http://127.0.0.1:8000**

### Terminal 2 - Frontend (React)

```cmd
cd C:\BCA_Project\athlete-performance-system\frontend
npm start
```

Or double-click: **`run-frontend.bat`**

Frontend runs at: **http://localhost:5173**

---

## Open the App

1. Open browser: **http://localhost:5173**
2. Login:
   - Username: `admin`
   - Password: `admin123`

---

## Database Setup

### SQLite (Default - No MySQL needed)

Already configured in `backend\.env`:
```
USE_SQLITE=True
```

Sample data loads automatically via `python manage.py seed_data`

### MySQL (Optional)

1. Run `database\schema.sql` in MySQL Workbench
2. Edit `backend\.env`:
   ```
   USE_SQLITE=False
   DB_PASSWORD=your_mysql_password
   ```
3. Run: `python manage.py migrate`

---

## Project Structure

```
C:\BCA_Project\athlete-performance-system\
├── setup.bat              ← Run once for setup
├── run-backend.bat        ← Start Django server
├── run-frontend.bat       ← Start React app
├── RUN_INSTRUCTIONS.md    ← This file
├── README.md
│
├── backend\               ← Django API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── api\
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── serializers.py
│   └── athlete_system\
│       └── settings.py
│
├── frontend\              ← React App
│   ├── package.json
│   ├── index.html
│   └── src\
│       ├── index.js       ← Entry point
│       ├── App.js         ← Main component
│       ├── App.jsx
│       ├── pages\
│       ├── components\
│       └── services\api.js
│
├── database\
│   ├── schema.sql
│   └── sample_data.sql
│
└── docs\
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `npm start` missing script | Run `npm install` first in frontend folder |
| `venv\Scripts\activate` not found | Run `setup.bat` or `python -m venv venv` in backend |
| `No module named django` | Activate venv: `venv\Scripts\activate` then `pip install -r requirements.txt` |
| Login fails | Run `python manage.py setup_admin` in backend |
| Port 8000 in use | Use `python manage.py runserver 8001` |
| npm blocked in PowerShell | Use Command Prompt or run `npm.cmd start` |

---

## Viva Demo Checklist

- [ ] Dashboard with charts loads
- [ ] Add / Edit / Delete athlete works
- [ ] Performance records save
- [ ] Injury tracking works
- [ ] PDF report downloads
- [ ] Explain: React (frontend) → Django API (backend) → SQLite/MySQL (database)