@echo off
REM SecureAuth Gateway - Quick Start Script for Windows

echo.
echo ====================================
echo   SecureAuth Gateway - Docker
echo ====================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [INFO] Docker is running...
echo.

REM Stop any existing containers
echo [INFO] Stopping existing containers...
docker-compose down
echo.

REM Build and start all services
echo [INFO] Building and starting all services...
echo [INFO] This may take a few minutes on first run...
echo.
docker-compose up --build

pause
