# Smart Campus Ecosystem - Test Script for Windows

Write-Host "🧪 Testing Smart Campus Ecosystem" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Test backend server
Write-Host "`nTesting Backend Server..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend server is not responding" -ForegroundColor Red
        Write-Host "Please start the backend server: cd backend; npm run dev" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend server is not running" -ForegroundColor Red
    Write-Host "Please start the backend server: cd backend; npm run dev" -ForegroundColor Yellow
}

# Test MongoDB connection
Write-Host "`nTesting MongoDB Connection..." -ForegroundColor Blue
try {
    $mongoTest = & mongosh --eval "db.runCommand('ping')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is connected" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
        Write-Host "Please start MongoDB: mongod" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  MongoDB client not found, skipping connection test" -ForegroundColor Yellow
}

# Test API endpoints
Write-Host "`nTesting API Endpoints..." -ForegroundColor Blue

# Test health endpoint
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction SilentlyContinue
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Health endpoint working" -ForegroundColor Green
    } else {
        Write-Host "❌ Health endpoint not working" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health endpoint not working" -ForegroundColor Red
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start MongoDB: mongod"
Write-Host "2. Backend: cd backend; npm run dev"
Write-Host "3. Web: cd web; npm start"
Write-Host "4. Mobile: cd mobile; npm run android"
