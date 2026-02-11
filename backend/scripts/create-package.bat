@echo off
echo ======================================================================
echo City Tools Server - Package Creator
echo ======================================================================
echo.

REM Change to backend directory
cd /d %~dp0..

REM Get version from package.json
for /f "tokens=2 delims=:, " %%a in ('findstr /r "\"version\"" package.json') do set VERSION=%%~a

echo Version: %VERSION%
echo.

REM Create package directory
set PACKAGE_DIR=CityTools-Server-%VERSION%
if exist "%PACKAGE_DIR%" rmdir /s /q "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%"

echo [1/6] Building production code...
node scripts/build-production.js
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Creating package structure...
xcopy /E /I /Y dist "%PACKAGE_DIR%\app"
mkdir "%PACKAGE_DIR%\scripts"
mkdir "%PACKAGE_DIR%\docs"

echo.
echo [3/6] Copying installation scripts...
copy scripts\setup-database.js "%PACKAGE_DIR%\scripts\"
copy scripts\install-service.js "%PACKAGE_DIR%\scripts\"
copy scripts\uninstall-service.js "%PACKAGE_DIR%\scripts\"

echo.
echo [4/6] Creating installer batch file...
(
echo @echo off
echo echo ======================================================================
echo echo City Tools Server - Installation Wizard
echo echo ======================================================================
echo echo.
echo echo This will install City Tools Server on this computer.
echo echo.
echo pause
echo.
echo cd app
echo echo Installing Node.js dependencies...
echo call npm install --production
echo.
echo cd ..
echo echo.
echo echo ======================================================================
echo echo Database Setup
echo echo ======================================================================
echo node scripts\setup-database.js
echo.
echo echo.
echo echo ======================================================================
echo echo Installing Windows Service
echo echo ======================================================================
echo echo This requires Administrator privileges.
echo echo Right-click and select "Run as Administrator" if prompted.
echo pause
echo node scripts\install-service.js
echo.
echo echo.
echo echo ======================================================================
echo echo Installation Complete!
echo echo ======================================================================
echo pause
) > "%PACKAGE_DIR%\INSTALL.bat"

echo.
echo [5/6] Creating README...
(
echo City Tools Server - Installation Package
echo =========================================
echo.
echo Version: %VERSION%
echo.
echo SYSTEM REQUIREMENTS:
echo - Windows 10/11
echo - Node.js 20 or higher
echo - PostgreSQL 15 or higher
echo - 4GB RAM minimum
echo.
echo INSTALLATION STEPS:
echo 1. Install Node.js from: https://nodejs.org
echo 2. Install PostgreSQL from: https://www.postgresql.org/download/windows/
echo 3. Right-click INSTALL.bat and select "Run as Administrator"
echo 4. Follow the on-screen instructions
echo.
echo SUPPORT:
echo For support and documentation, contact your system administrator.
echo.
) > "%PACKAGE_DIR%\README.txt"

echo.
echo [6/6] Creating archive...
powershell Compress-Archive -Path "%PACKAGE_DIR%" -DestinationPath "%PACKAGE_DIR%.zip" -Force

echo.
echo ======================================================================
echo Package Created Successfully!
echo ======================================================================
echo.
echo Package: %PACKAGE_DIR%.zip
echo.
dir "%PACKAGE_DIR%.zip" | find ".zip"
echo.
echo You can now distribute this package to clients.
echo.
pause
