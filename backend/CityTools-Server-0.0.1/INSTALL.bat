@echo off
echo ======================================================================
echo City Tools Server - Installation Wizard
echo ======================================================================
echo.
echo This will install City Tools Server on this computer.
echo.
pause

cd app
echo Installing Node.js dependencies...
call npm install --production

cd ..
echo.
echo ======================================================================
echo Database Setup
echo ======================================================================
node scripts\setup-database.js

echo.
echo ======================================================================
echo Installing Windows Service
echo ======================================================================
echo This requires Administrator privileges.
echo Right-click and select "Run as Administrator" if prompted.
pause
node scripts\install-service.js

echo.
echo ======================================================================
echo Installation Complete!
echo ======================================================================
pause
