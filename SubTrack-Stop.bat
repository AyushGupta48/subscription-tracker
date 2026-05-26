@echo off
title SubTrack - Stopping

echo.
echo  Stopping SubTrack...

:: Kill the named terminal windows we launched
taskkill /FI "WINDOWTITLE eq SubTrack-Server" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq SubTrack-Client" /F >nul 2>&1

:: Also kill any node processes on ports 3000 and 3001 (belt and braces)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo  SubTrack stopped.
echo.
timeout /t 2 /nobreak >nul
