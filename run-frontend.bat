@echo off
title APITS - React Frontend
cd /d "%~dp0frontend"
echo Starting React app at http://localhost:5173
call npm start
pause