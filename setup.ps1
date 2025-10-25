# Smart Campus Ecosystem Installation Script for Windows

Write-Host "🚀 Smart Campus Ecosystem Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Node.js is installed
$nodeVersion = & node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v16 or higher." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is installed (check for mongod command)
$mongoCheck = & where.exe mongod 2>$null
if (-not $mongoCheck) {
    Write-Host "❌ MongoDB is not installed. Please install MongoDB." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Backend setup
Write-Host "📦 Setting up backend..." -ForegroundColor Blue
Set-Location backend
npm install

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    @"
MONGODB_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-api-key
FCM_SERVER_KEY=your-fcm-server-key
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "⚠️  Please update the .env file with your actual configuration values" -ForegroundColor Yellow
}

Set-Location ..

# Web frontend setup
Write-Host "🌐 Setting up web frontend..." -ForegroundColor Blue
Set-Location web
npm install
Set-Location ..

# Mobile app setup
Write-Host "📱 Setting up mobile app..." -ForegroundColor Blue
Set-Location mobile
npm install
Set-Location ..

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development servers:" -ForegroundColor Cyan
Write-Host "1. Start MongoDB: mongod"
Write-Host "2. Backend: cd backend; npm run dev"
Write-Host "3. Web: cd web; npm start"
Write-Host "4. Mobile: cd mobile; npm run android (or npm run ios)"
Write-Host ""
Write-Host "📖 For more information, check the README.md file" -ForegroundColor Cyan
