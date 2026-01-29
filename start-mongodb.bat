@echo off
echo Starting Villarrica DMS with MongoDB...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend-mongodb
if not exist node_modules (
    echo Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)

REM Seed the database
echo.
echo Cleaning and seeding MongoDB database...
npm run cleanup-seed
if %errorlevel% neq 0 (
    echo Warning: Database seeding failed, but continuing...
)

REM Start backend server
echo.
echo Starting MongoDB backend server...
start "MongoDB Backend" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go back to root and install frontend dependencies
cd ..
echo.
echo Installing frontend dependencies...
if not exist node_modules (
    echo Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

REM Start frontend server
echo.
echo Starting Next.js frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Villarrica DMS Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5002
echo Database: MongoDB (Cloud)
echo.
echo Demo Users:
echo - Admin:   admin@villarrica.gov / admin123
echo - Manager: manager@villarrica.gov / manager123
echo - User:    user@villarrica.gov / user123
echo - Clerk:   clerk@villarrica.gov / clerk123
echo.
echo Press any key to exit this window...
pause >nul