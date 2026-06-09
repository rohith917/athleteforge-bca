@echo off
echo.
echo ============================================
echo  AthleteForge - Render + Auto Keep-Alive
echo ============================================
echo.
echo SLOW LOAD FIX: GitHub now pings your server every 10 min
echo so Render stays awake (no 60-second cold start).
echo.
echo 1. Push latest code to GitHub (already done if you pulled)
echo 2. GitHub Actions -^> "Keep Server Warm" must be enabled
echo 3. Render -^> athleteforge-bca -^> Manual Deploy
echo.
echo FASTEST OPTION: Use Railway instead (see deploy-railway.bat)
echo.
echo LIVE URL: https://athleteforge-bca.onrender.com/login
echo Login: admin / admin123
echo.
start https://github.com/rohith917/athleteforge-bca/actions
start https://athleteforge-bca.onrender.com/login
pause