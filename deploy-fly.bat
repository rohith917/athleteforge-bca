@echo off
title AthleteForge - Deploy on Fly.io
set FLYCTL=%USERPROFILE%\.fly\bin\flyctl.exe
cd /d "%~dp0"

echo.
echo ============================================
echo  AthleteForge - Deploy on FLY.IO
echo ============================================
echo.

if not exist "%FLYCTL%" (
  echo Installing Fly CLI...
  powershell -NoProfile -Command "iwr https://fly.io/install.ps1 -useb | iex"
)

echo STEP 1: Login to Fly.io (browser will open)...
"%FLYCTL%" auth login
if errorlevel 1 goto fail

echo.
echo STEP 2: Create app (first time only)...
"%FLYCTL%" apps create athleteforge-bca --org personal 2>nul

echo.
echo STEP 3: Database — use FREE Neon PostgreSQL:
echo   1. Open https://neon.tech and create a project
echo   2. Copy the postgresql:// connection string
echo.
set /p NEON_URL=Paste Neon DATABASE_URL here (or press Enter to skip): 
if not "%NEON_URL%"=="" (
  "%FLYCTL%" secrets set DATABASE_URL="%NEON_URL%" -a athleteforge-bca
)

echo.
echo STEP 4: Set secrets...
"%FLYCTL%" secrets set SECRET_KEY=athleteforge-fly-secret-2026 DEBUG=False SAME_ORIGIN_DEPLOY=True -a athleteforge-bca

echo.
echo STEP 5: Deploying (5-10 min)...
"%FLYCTL%" deploy -a athleteforge-bca
if errorlevel 1 goto fail

echo.
echo STEP 6: Opening your site...
"%FLYCTL%" open -a athleteforge-bca
echo.
echo DONE! URL: https://athleteforge-bca.fly.dev
echo Login: admin / admin123
pause
exit /b 0

:fail
echo.
echo Deploy failed. See FLY_DEPLOY.txt for manual steps.
start notepad "%~dp0FLY_DEPLOY.txt"
pause
exit /b 1