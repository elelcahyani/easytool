@echo off
echo Starting Easy Tool (Backend + Frontend)...
start cmd /k "call start-backend.bat"
timeout /t 3
start cmd /k "call start-frontend.bat"
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
