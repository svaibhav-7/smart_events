#!/bin/bash

# Smart Campus Ecosystem Installation Script

echo "🚀 Smart Campus Ecosystem Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed. Please install MongoDB."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
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
EOL
    echo "⚠️  Please update the .env file with your actual configuration values"
fi

cd ..

# Web frontend setup
echo "🌐 Setting up web frontend..."
cd web
npm install
cd ..

# Mobile app setup
echo "📱 Setting up mobile app..."
cd mobile
npm install
cd ..

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the development servers:"
echo "1. Start MongoDB: mongod"
echo "2. Backend: cd backend && npm run dev"
echo "3. Web: cd web && npm start"
echo "4. Mobile: cd mobile && npm run android (or npm run ios)"
echo ""
echo "📖 For more information, check the README.md file"
