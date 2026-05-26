@echo off
title SubTrack - Setup Desktop Shortcut

echo.
echo  ============================================
echo    SubTrack - Creating Desktop Shortcut
echo  ============================================
echo.

set "ROOT=%~dp0"
set "BAT=%ROOT%SubTrack.bat"
set "SHORTCUT=%USERPROFILE%\Desktop\SubTrack.lnk"

:: Use PowerShell to create a proper .lnk shortcut
powershell -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $s = $ws.CreateShortcut('%SHORTCUT%'); ^
   $s.TargetPath = '%BAT%'; ^
   $s.WorkingDirectory = '%ROOT%'; ^
   $s.Description = 'Launch SubTrack Subscription Tracker'; ^
   $s.WindowStyle = 1; ^
   $s.Save()"

if exist "%SHORTCUT%" (
    echo  Done! A "SubTrack" shortcut has been added to your Desktop.
    echo.
    echo  Double-click it anytime to launch the app.
    echo.
) else (
    echo  Shortcut creation failed. You can still run SubTrack.bat directly.
    echo.
)

pause
