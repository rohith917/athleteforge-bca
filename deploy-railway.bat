@echo off
title AthleteForge - Deploy on Railway
cd /d "%~dp0"

echo.
echo ============================================
echo  AthleteForge - Deploy on RAILWAY
echo ============================================
echo.
echo Repo: https://github.com/rohith917/athleteforge-bca
echo Branch: main (Dockerfile auto-builds frontend + backend)
echo.

where railway >nul 2>&1
if errorlevel 1 (
  echo Installing Railway CLI...
  call npm.cmd install -g @railway/cli
)

echo Checking Railway login...
railway whoami >nul 2>&1
if errorlevel 1 (
  echo.
  echo Not logged in. Opening browser for Railway login...
  echo Complete login in the browser, then run this script again.
  railway login
  if errorlevel 1 pause & exit /b 1
)

echo.
echo Logged in as:
railway whoami
echo.
echo Opening Railway dashboard and deploy guide...
start https://railway.com/dashboard
start https://railway.com/new/github
start notepad "%~dp0RAILWAY_DEPLOY.txt"
echo.
echo QUICK SETUP in Railway dashboard:
echo   1. New Project - Deploy from GitHub - athleteforge-bca
echo   2. + New - Database - PostgreSQL
echo   3. Web service - Variables - Add Reference - Postgres - DATABASE_URL
echo   4. Add: SECRET_KEY, DEBUG=False, SAME_ORIGIN_DEPLOY=True
echo   5. Settings - Networking - Generate Domain
echo.
echo Optional CLI deploy from this folder:
echo   railway link
echo   railway up
echo.
pause