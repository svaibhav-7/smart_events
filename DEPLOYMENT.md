# Smart Campus Ecosystem - Deployment Guide

This guide covers deployment options for the Smart Campus Ecosystem on various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

### Local Development Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd smart-campus-ecosystem
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install web dependencies
cd web && npm install && cd ..

# Install mobile dependencies
cd mobile && npm install && cd ..
```

3. Configure environment variables:
```bash
# Copy and edit the environment file
cd backend
cp .env.example .env
# Edit .env with your configuration
```

4. Start services:
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Web Frontend
cd web && npm start

# Terminal 4: Start Mobile (Android)
cd mobile && npm run android
```

## 🌐 Web Application Deployment

### Option 1: Render (Recommended)

1. **Prepare the application:**
   - Ensure your web app builds successfully: `cd web && npm run build`
   - Update API URLs in web/src/utils/api.js to point to your production backend

2. **Deploy to Render:**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set build command: `npm install && npm run build`
   - Set publish directory: `build`
   - Add environment variables (if needed)

3. **Configure Custom Domain (Optional):**
   - Add your domain in Render dashboard
   - Update DNS settings

### Option 2: Vercel

1. **Deploy:**
   ```bash
   cd web
   npm install -g vercel
   vercel --prod
   ```

2. **Configure:**
   - Set up environment variables in Vercel dashboard
   - Update API URLs for production

### Option 3: Netlify

1. **Deploy:**
   ```bash
   cd web
   npm run build
   # Upload the build folder to Netlify
   ```

2. **Configure:**
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables

## 🖥️ Backend Deployment

### Option 1: Render

1. **Create Web Service:**
   - Connect your repository
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=https://your-frontend-domain.com
   # Add other required variables
   ```

3. **Database:**
   - Use MongoDB Atlas for production database
   - Update connection string in environment variables

### Option 2: Heroku

1. **Deploy:**
   ```bash
   cd backend
   heroku create your-app-name
   heroku buildpacks:add heroku/nodejs
   git push heroku main
   ```

2. **Configure:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   # Set other environment variables
   ```

### Option 3: DigitalOcean/AWS/VPS

1. **Server Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install MongoDB or use MongoDB Atlas
   ```

2. **Deploy Application:**
   ```bash
   git clone <repository>
   cd smart-campus-ecosystem/backend
   npm install --production
   npm start
   ```

3. **Process Management:**
   ```bash
   # Install PM2
   npm install -g pm2
   pm2 start server.js --name "smart-campus-backend"
   pm2 startup
   pm2 save
   ```

## 📱 Mobile App Deployment

### Android APK Generation

1. **Generate Release Build:**
   ```bash
   cd mobile
   npm run build:apk
   ```

2. **Sign the APK:**
   - Create a keystore: `keytool -genkey -v -keystore smart-campus.keystore -alias smart-campus -keyalg RSA -keysize 2048 -validity 10000`
   - Configure signing in `android/app/build.gradle`

3. **Deploy:**
   - Upload APK to Google Play Store
   - Or distribute via Firebase App Distribution

### iOS Deployment

1. **Archive and Export:**
   ```bash
   cd mobile/ios
   xcodebuild -workspace SmartCampus.xcworkspace -scheme SmartCampus -configuration Release archive
   ```

2. **Deploy to App Store:**
   - Create App Store listing
   - Upload IPA file via App Store Connect

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Cloud)

1. **Create Account:**
   - Sign up at https://cloud.mongodb.com
   - Create a new cluster

2. **Configure Connection:**
   - Get connection string from Atlas dashboard
   - Update `MONGODB_URI` in environment variables

3. **Security:**
   - Set up database user with limited permissions
   - Configure IP whitelist

### Option 2: Local MongoDB

1. **Install MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS
   brew install mongodb-community

   # Windows
   # Download from mongodb.com
   ```

2. **Start MongoDB:**
   ```bash
   mongod
   ```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Database
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-campus

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d

# Server
PORT=5000
CLIENT_URL=https://your-frontend-domain.com

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Storage (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Push Notifications (Optional)
FCM_SERVER_KEY=your-fcm-server-key
```

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong, unique passwords
   - Rotate JWT secrets regularly

2. **Database Security:**
   - Use MongoDB Atlas for production
   - Enable authentication
   - Set up IP restrictions

3. **HTTPS:**
   - Enable SSL/TLS in production
   - Use secure cookies
   - Set up proper CORS policies

4. **Rate Limiting:**
   - Configure rate limiting for API endpoints
   - Monitor for suspicious activity

## 📊 Monitoring and Logging

1. **Application Monitoring:**
   - Use services like Sentry for error tracking
   - Monitor server performance with New Relic

2. **Logging:**
   - Implement structured logging
   - Set up log rotation
   - Monitor error logs

3. **Database Monitoring:**
   - Monitor MongoDB performance
   - Set up alerts for connection issues

## 🚀 Performance Optimization

1. **Backend:**
   - Implement caching (Redis)
   - Optimize database queries
   - Use connection pooling

2. **Frontend:**
   - Optimize images
   - Implement lazy loading
   - Use CDN for static assets

3. **Database:**
   - Create appropriate indexes
   - Monitor query performance
   - Consider read replicas

## 🔄 CI/CD Pipeline

### GitHub Actions Example

1. **Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Deploy Backend
      run: |
        # Deploy backend to Render/Heroku

    - name: Deploy Frontend
      run: |
        # Deploy frontend to Vercel/Netlify
```

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues:**
   - Check connection string format
   - Verify network access
   - Check authentication credentials

2. **Port Conflicts:**
   - Change default ports in environment variables
   - Kill processes using ports: `lsof -ti:3000 | xargs kill -9`

3. **Build Failures:**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Support Resources

- **Documentation:** Check the README.md file
- **Issues:** Create GitHub issues for bugs
- **Discussions:** Use GitHub Discussions for questions

## 📞 Production Support

For production deployments, consider:

1. **24/7 Monitoring:** Set up alerts for downtime
2. **Backup Strategy:** Regular database backups
3. **Disaster Recovery:** Plan for system failures
4. **Security Audits:** Regular security reviews

---

## 🎯 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints working
- [ ] Frontend build successful
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security measures in place

**Congratulations! Your Smart Campus Ecosystem is now deployed and ready to serve users!** 🎉
