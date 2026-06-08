@echo off
title APITS - One Time Setup
echo ============================================
echo  Athlete Performance and Injury Tracking System
echo  ONE-TIME PROJECT SETUP
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Creating Python virtual environment...
cd backend
if not exist venv (
    python -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

echo.
echo [2/4] Installing Python packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [3/4] Setting up database...
python manage.py migrate
python manage.py setup_admin
python manage.py seed_data

cd ..

echo.
echo [4/4] Installing Node.js packages...
cd frontend
call npm install

cd ..
echo.
echo ============================================
echo  SETUP COMPLETE!
echo ============================================
echo.
echo  Login: admin / admin123
echo  Run backend:  run-backend.bat
echo  Run frontend: run-frontend.bat
echo.
pause