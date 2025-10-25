#!/bin/bash

# Smart Campus Backend Startup Script
# This script kills any process using port 5000 and starts the server

echo "🔍 Checking for processes using port 5000..."

# Find and kill any process using port 5000
PID=$(netstat -ano | findstr :5000 | awk '{print $5}' | head -1)

if [ -n "$PID" ] && [ "$PID" != "0" ]; then
    echo "⚠️  Found process $PID using port 5000. Killing it..."
    taskkill /PID $PID /F >nul 2>&1
    echo "✅ Process killed successfully"
else
    echo "✅ Port 5000 is available"
fi

echo "🚀 Starting the server..."
npm run dev
