@echo off
title AthleteForge - Public URL via ngrok
echo.
echo ============================================
echo  Get a PUBLIC online URL from your laptop
echo  (Works when Railway/Render are down)
echo ============================================
echo.
echo STEP 1: Starting local website...
call "%~dp0START_DEMO.bat"
echo.
echo STEP 2: Install ngrok (one-time):
echo   https://ngrok.com/download
echo.
echo STEP 3: After install, open NEW terminal and run:
echo   ngrok http 5173
echo.
echo STEP 4: Copy the https://xxxx.ngrok-free.app URL
echo         That is your public website link!
echo.
start https://ngrok.com/download
start https://dashboard.ngrok.com/get-started/your-authtoken
pause