@echo off
echo Starting Document Management System...
echo.

echo Starting MongoDB Backend...
start "MongoDB Backend" cmd /k "cd backend-mongodb && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo System is starting up...
echo Backend will be available at: http://localhost:5004
echo Frontend will be available at: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul