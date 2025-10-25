#!/bin/bash

# Smart Campus Ecosystem - Test Script

echo "🧪 Testing Smart Campus Ecosystem"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test backend server
echo -e "\n${YELLOW}Testing Backend Server...${NC}"
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server is not responding${NC}"
    echo "Please start the backend server: cd backend && npm run dev"
fi

# Test MongoDB connection
echo -e "\n${YELLOW}Testing MongoDB Connection...${NC}"
if command -v mongosh > /dev/null 2>&1; then
    if mongosh --eval "db.runCommand('ping')" $MONGODB_URI > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is connected${NC}"
    else
        echo -e "${RED}❌ MongoDB connection failed${NC}"
        echo "Please start MongoDB: mongod"
    fi
elif command -v mongo > /dev/null 2>&1; then
    if mongo --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is connected${NC}"
    else
        echo -e "${RED}❌ MongoDB connection failed${NC}"
        echo "Please start MongoDB: mongod"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB client not found, skipping connection test${NC}"
fi

# Test API endpoints
echo -e "\n${YELLOW}Testing API Endpoints...${NC}"

# Test health endpoint
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health endpoint working${NC}"
else
    echo -e "${RED}❌ Health endpoint not working${NC}"
fi

# Test auth endpoints
if curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth endpoints accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Auth endpoints require authentication${NC}"
fi

echo -e "\n${GREEN}🎉 Test completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: mongod"
echo "2. Backend: cd backend && npm run dev"
echo "3. Web: cd web && npm start"
echo "4. Mobile: cd mobile && npm run android"
