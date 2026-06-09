@echo off
echo.
echo ============================================
echo  AthleteForge - FAST deploy on Railway
echo ============================================
echo.
echo Railway is faster than Render free tier (no 60s cold start).
echo.
echo STEPS (one-time, ~10 minutes):
echo.
echo 1. Open https://railway.com and sign in with GitHub
echo 2. New Project -^> Deploy from GitHub repo
echo 3. Select: rohith917/athleteforge-bca
echo 4. Railway detects Dockerfile automatically
echo 5. Add PostgreSQL: click project -^> + New -^> Database -^> PostgreSQL
echo 6. Click web service -^> Variables -^> add:
echo      DATABASE_URL = (copy from PostgreSQL service -^> Connect)
echo      SECRET_KEY   = any-long-random-string
echo      DEBUG        = False
echo      SAME_ORIGIN_DEPLOY = True
echo 7. Settings -^> Generate Domain (you get a .railway.app URL)
echo 8. Deploy - wait 5-8 min
echo.
echo Your live URL will be like:
echo   https://athleteforge-bca-production.up.railway.app
echo.
echo ALSO: GitHub keep-alive workflow keeps Render warm if you still use Render.
echo.
start https://railway.com/new
start https://github.com/rohith917/athleteforge-bca/actions
pause