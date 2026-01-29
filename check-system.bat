@echo off
echo 🔍 Checking System Status...
echo.

echo Testing Backend (http://localhost:5004)...
curl -s http://localhost:5004/api/health > nul
if %errorlevel% == 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not responding
)

echo.
echo Testing Frontend (http://localhost:3000)...
curl -s http://localhost:3000 > nul
if %errorlevel% == 0 (
    echo ✅ Frontend is running
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 📋 System URLs:
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5004
echo 📊 Health Check: http://localhost:5004/api/health
echo.
echo 🔐 Admin Login:
echo 📧 Email: admin@villarrica.gov
echo 🔑 Password: admin123
echo.
pause