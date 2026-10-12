@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
  py -m http.server 3000
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
  python -m http.server 3000
  exit /b
)
echo Python was not found. Opening index.html directly instead.
start "" index.html
