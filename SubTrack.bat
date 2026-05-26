@echo off
title SubTrack Launcher

echo.
echo  ============================================
echo    SubTrack - Starting up...
echo  ============================================
echo.

:: --- Find the folder this .bat file lives in ---
set "ROOT=%~dp0"
set "SERVER=%ROOT%server"
set "CLIENT=%ROOT%client"

:: --- Check Node is installed ---
where node >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js not found. Please install it from https://nodejs.org
    pause
    exit /b
)

:: --- Check node_modules exist, install if not ---
if not exist "%SERVER%\node_modules" (
    echo  First run: installing server dependencies...
    cd /d "%SERVER%"
    call npm install
    echo.
)

if not exist "%CLIENT%\node_modules" (
    echo  First run: installing client dependencies...
    cd /d "%CLIENT%"
    call npm install
    echo.
)

:: --- Start backend in a hidden window ---
echo  Starting backend server...
start "SubTrack-Server" /min cmd /c "cd /d "%SERVER%" && node index.js"

:: --- Wait a moment for backend to boot ---
timeout /t 2 /nobreak >nul

:: --- Start frontend in a hidden window ---
echo  Starting frontend...
start "SubTrack-Client" /min cmd /c "cd /d "%CLIENT%" && set BROWSER=none && npm start"

:: --- Wait for React to compile (usually 10-15 seconds) ---
echo  Waiting for app to compile (this takes ~15 seconds)...
timeout /t 15 /nobreak >nul

:: --- Open browser ---
echo  Opening SubTrack in your browser...
start http://localhost:3000

echo.
echo  ============================================
echo    SubTrack is running!
echo    Open: http://localhost:3000
echo    To stop: run SubTrack-Stop.bat
echo  ============================================
echo.
echo  You can minimise this window. Close it only after stopping the app.
echo.
pause
