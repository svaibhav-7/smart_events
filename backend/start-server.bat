@echo off
REM Smart Campus Backend Startup Script for Windows
REM This script kills any process using port 5000 and starts the server

echo 🔍 Checking for processes using port 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo ⚠️  Found process %%a using port 5000. Killing it...
        taskkill /PID %%a /F >nul 2>&1
        echo ✅ Process killed successfully
    )
)

echo 🚀 Starting the server...
npm run dev
