# Windows Setup Script for Smart Campus Mobile App

Write-Host "🚀 Setting up React Native development environment for Windows" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Check if Java is installed
Write-Host "`n📋 Checking Java installation..." -ForegroundColor Blue
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Java is not installed" -ForegroundColor Red
    Write-Host "Please install Java JDK 11 or higher from:" -ForegroundColor Yellow
    Write-Host "https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Yellow
}

# Check if Node.js is installed
Write-Host "`n📋 Checking Node.js installation..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Yellow
}

# Check if Android Studio is installed
Write-Host "`n📋 Checking Android Studio installation..." -ForegroundColor Blue
$androidStudioPath = "${env:ProgramFiles}\Android\Android Studio"
if (Test-Path $androidStudioPath) {
    Write-Host "✅ Android Studio is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Android Studio is not installed" -ForegroundColor Red
    Write-Host "Please install Android Studio from:" -ForegroundColor Yellow
    Write-Host "https://developer.android.com/studio" -ForegroundColor Yellow
}

# Check if Android SDK is configured
Write-Host "`n📋 Checking Android SDK configuration..." -ForegroundColor Blue
$androidHome = $env:ANDROID_HOME
if ($androidHome) {
    Write-Host "✅ ANDROID_HOME is set: $androidHome" -ForegroundColor Green
} else {
    Write-Host "❌ ANDROID_HOME environment variable is not set" -ForegroundColor Red
    Write-Host "Please set ANDROID_HOME to your Android SDK path" -ForegroundColor Yellow
    Write-Host "Usually: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" -ForegroundColor Yellow
}

# Check PATH for Android tools
Write-Host "`n📋 Checking Android tools in PATH..." -ForegroundColor Blue
$pathContainsAndroid = $env:PATH -like "*android*"
if ($pathContainsAndroid) {
    Write-Host "✅ Android tools are in PATH" -ForegroundColor Green
} else {
    Write-Host "❌ Android tools are not in PATH" -ForegroundColor Red
    Write-Host "Add these to your PATH:" -ForegroundColor Yellow
    Write-Host "1. %ANDROID_HOME%\platform-tools" -ForegroundColor Yellow
    Write-Host "2. %ANDROID_HOME%\emulator" -ForegroundColor Yellow
    Write-Host "3. %ANDROID_HOME%\tools" -ForegroundColor Yellow
    Write-Host "4. %ANDROID_HOME%\tools\bin" -ForegroundColor Yellow
}

Write-Host "`n🔧 Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Install Android Studio from https://developer.android.com/studio" -ForegroundColor White
Write-Host "2. In Android Studio, go to Tools > SDK Manager" -ForegroundColor White
Write-Host "3. Install Android SDK Platform 29 or higher" -ForegroundColor White
Write-Host "4. Install Android SDK Build-Tools" -ForegroundColor White
Write-Host "5. Create a virtual device in AVD Manager" -ForegroundColor White
Write-Host "6. Set ANDROID_HOME environment variable" -ForegroundColor White
Write-Host "7. Add Android tools to PATH" -ForegroundColor White
Write-Host "8. Restart your command prompt" -ForegroundColor White

Write-Host "`n📱 Alternative: Use Expo Go (Easier Setup)" -ForegroundColor Cyan
Write-Host "If Android Studio setup is complex, consider using Expo:" -ForegroundColor Yellow
Write-Host "1. npm install -g @expo/cli" -ForegroundColor White
Write-Host "2. npx create-expo-app smart-campus-expo" -ForegroundColor White
Write-Host "3. Use Expo Go app on your phone for testing" -ForegroundColor White

Write-Host "`n🎯 Quick Test Commands:" -ForegroundColor Cyan
Write-Host "react-native doctor" -ForegroundColor White
Write-Host "adb devices" -ForegroundColor White
Write-Host "emulator -list-avds" -ForegroundColor White
