@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org then run this file again.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0]) < 22) process.exit(1)"
if errorlevel 1 (
  echo Please update Node.js to version 22 or newer from https://nodejs.org
  pause
  exit /b 1
)
echo Getting Wild Putt ready. The first run needs an internet connection.
call npm ci --omit=dev --cache "%TEMP%\wild-putt-npm"
if errorlevel 1 (
  echo Setup did not complete. Check your internet connection and try again.
  pause
  exit /b 1
)
call npm run host
pause
