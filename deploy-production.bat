@echo off
title AthleteForge - REAL WORLD Deploy
echo.
echo ============================================
echo  AthleteForge - PRODUCTION DEPLOY
echo  Real public website for the world
echo ============================================
echo.
echo RECOMMENDED: Koyeb (easiest, browser only)
echo.
echo Choose:
echo   1 = Koyeb  (recommended - 15 min)
echo   2 = Fly.io (professional - needs login)
echo   3 = Read full guide
echo.
set /p CHOICE=Enter 1, 2, or 3: 

if "%CHOICE%"=="1" (
  start notepad "%~dp0KOYEB_DEPLOY.txt"
  start https://app.koyeb.com/
  start https://github.com/rohith917/athleteforge-bca
  echo Follow KOYEB_DEPLOY.txt — you will get a .koyeb.app URL
)
if "%CHOICE%"=="2" (
  call "%~dp0deploy-fly.bat"
)
if "%CHOICE%"=="3" (
  start notepad "%~dp0DEPLOY_REAL_WORLD.txt"
)
pause