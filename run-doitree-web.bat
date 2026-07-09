@echo off
setlocal

cd /d "%~dp0"
set "PORT=5188"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH.
  echo Install Node.js or open index.html directly in your browser.
  pause
  exit /b 1
)

echo Starting DOI Tree Web App on http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"
node server.js

echo.
echo Server stopped.
pause
