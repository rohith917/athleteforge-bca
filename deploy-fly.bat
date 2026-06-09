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
echo STEP 2: Create app and Postgres (first time only)...
echo If app already exists, skip errors and continue.
"%FLYCTL%" apps create athleteforge-bca --org personal 2>nul
"%FLYCTL%" postgres create --name athleteforge-db --region sin --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1 2>nul
"%FLYCTL%" postgres attach athleteforge-db -a athleteforge-bca 2>nul

echo.
echo STEP 3: Set secrets...
"%FLYCTL%" secrets set SECRET_KEY=athleteforge-fly-secret-2026 DEBUG=False SAME_ORIGIN_DEPLOY=True -a athleteforge-bca

echo.
echo STEP 4: Deploying (5-10 min)...
"%FLYCTL%" deploy -a athleteforge-bca
if errorlevel 1 goto fail

echo.
echo STEP 5: Opening your site...
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