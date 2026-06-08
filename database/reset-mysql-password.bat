@echo off
:: Run this file as Administrator (right-click -> Run as administrator)
:: Resets MySQL root password to: admin123

echo ============================================
echo  MySQL Password Reset Script
echo  New password: admin123
echo ============================================
echo.

net stop MySQL80
timeout /t 3 /nobreak > nul

echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'admin123';> "%TEMP%\mysql-reset.sql"
echo FLUSH PRIVILEGES;>> "%TEMP%\mysql-reset.sql"

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%TEMP%\mysql-reset.sql" --console

timeout /t 5 /nobreak > nul
net start MySQL80

del "%TEMP%\mysql-reset.sql"

echo.
echo Done! MySQL root password is now: admin123
echo Update backend\.env: set USE_SQLITE=False
echo Then run: python manage.py migrate
pause