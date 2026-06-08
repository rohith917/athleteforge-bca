@echo off
REM Push AthleteForge to GitHub - run AFTER creating repo on github.com
set GIT="C:\Program Files\Git\bin\git.exe"
cd /d C:\BCA_Project\athlete-performance-system

echo.
echo ============================================
echo  AthleteForge - Push to GitHub
echo ============================================
echo.

set /p GITHUB_USER=Enter your GitHub username: 
set REPO_NAME=athleteforge-bca

echo.
echo Make sure you created this empty repo on GitHub:
echo   https://github.com/%GITHUB_USER%/%REPO_NAME%
echo   (Do NOT add README, .gitignore, or license)
echo.
pause

%GIT% remote remove origin 2>nul
%GIT% remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
%GIT% branch -M main
%GIT% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Code is on GitHub.
    echo Repo: https://github.com/%GITHUB_USER%/%REPO_NAME%
) else (
    echo.
    echo Push failed. Common fixes:
    echo 1. Create the repo on GitHub first
    echo 2. Use Personal Access Token as password when prompted
    echo    GitHub - Settings - Developer settings - Personal access tokens
)

pause