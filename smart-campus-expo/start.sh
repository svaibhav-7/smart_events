#!/bin/bash

echo "🚀 Smart Campus Expo App - Quick Start Guide"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the smart-campus-expo directory"
    echo "📍 Current directory: $(pwd)"
    echo "📍 Target directory: smart-campus-expo"
    exit 1
fi

echo "✅ In the correct directory: $(pwd)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    echo ""
    echo "🎯 Choose how to run the app:"
    echo ""
    echo "1️⃣  Web Browser (Recommended - Instant)"
    echo "   npx expo start --web"
    echo ""
    echo "2️⃣  Phone with Expo Go App (Best Experience)"
    echo "   - Install Expo Go from App Store/Google Play"
    echo "   - Run: npx expo start"
    echo "   - Scan QR code with Expo Go app"
    echo ""
    echo "3️⃣  Android Emulator (Requires Android Studio)"
    echo "   npx expo start --android"
    echo ""
    echo "📱 For phone testing:"
    echo "   1. Install Expo Go app on your phone"
    echo "   2. Make sure phone and computer are on same WiFi"
    echo "   3. Run: npx expo start"
    echo "   4. Scan QR code with Expo Go"
    echo ""
    echo "🌐 Backend should be running at: http://localhost:5000"
    echo ""
    echo "🎉 Ready to test!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
