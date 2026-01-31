@echo off
echo ========================================
echo   Document Management System - React
echo ========================================
echo.
echo Starting both Backend and Frontend servers...
echo.
echo Backend (MongoDB): http://localhost:5004
echo Frontend (React):  http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in a new window
start "Backend Server" cmd /k "cd backend-mongodb && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in current window
echo Starting React frontend...
npm run dev