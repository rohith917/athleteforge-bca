@echo off
echo.
echo ============================================
echo  AthleteForge - Deploy on RAILWAY
echo  (Use this instead of Render)
echo ============================================
echo.
echo Opening step-by-step guide and Railway...
echo.
start notepad "%~dp0RAILWAY_DEPLOY.txt"
start https://railway.com/new
start https://github.com/rohith917/athleteforge-bca
echo.
echo Follow RAILWAY_DEPLOY.txt — takes about 10 minutes.
echo After deploy you get a URL like:
echo   https://something.up.railway.app
echo.
pause