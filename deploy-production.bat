@echo off
title AthleteForge - Production Deploy
cd /d "%~dp0"

echo.
echo ============================================
echo  AthleteForge - PRODUCTION DEPLOY
echo ============================================
echo.
echo PRIMARY: Render (recommended)
echo   URL: https://athleteforge-bca.onrender.com
echo.
echo Opening Render deploy guide and dashboard...
call "%~dp0redeploy-render.bat"