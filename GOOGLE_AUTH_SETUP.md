# Google OAuth Setup Guide for Smart Campus

This guide explains how to set up Google OAuth authentication for KLH University (@klh.edu.in domain restriction).

## 🚀 **Setup Steps**

### **1. Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google OAuth2 API"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"

4. **Configure OAuth Consent Screen**
   - Go to "OAuth consent screen"
   - Choose "External" (or "Internal" if you have Google Workspace)
   - Fill in required fields:
     - **App name**: "Smart Campus"
     - **User support email**: your_email@klh.edu.in
     - **Developer contact**: your_email@klh.edu.in
   - Add scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`

5. **Get Client ID and Secret**
   - After creating OAuth client ID, note down:
     - **Client ID** (starts with numbers)
     - **Client Secret** (long string)

### **2. Backend Configuration**

1. **Update Environment Variables**
   ```bash
   # Edit backend/.env file
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ALLOWED_EMAIL_DOMAIN=klh.edu.in
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start Backend**
   ```bash
   npm run dev
   ```

### **3. Frontend Configuration**

1. **Update Environment (if needed)**
   - The frontend is already configured for localhost:5000
   - No additional configuration needed

2. **Install Dependencies**
   ```bash
   cd smart-campus-expo
   npm install
   ```

3. **Start Frontend**
   ```bash
   npx expo start
   ```

## 🎯 **Testing Google Authentication**

### **Method 1: Web Browser (Easiest)**
1. Open: `http://localhost:19000`
2. Click "Run in web browser"
3. On login page, click "Continue with Google (@klh.edu.in)"
4. Complete Google OAuth flow

### **Method 2: Mobile Phone**
1. Install **Expo Go** app on your phone
2. Make sure phone and computer are on **same WiFi**
3. Run: `npx expo start`
4. **Scan QR code** with Expo Go
5. Test Google sign-in on mobile

## 🔧 **Domain Restriction**

The system is configured to **only allow @klh.edu.in email addresses**:

- ✅ **student@klh.edu.in** - Allowed
- ✅ **faculty@klh.edu.in** - Allowed
- ✅ **admin@klh.edu.in** - Allowed
- ❌ **student@gmail.com** - **Blocked**
- ❌ **user@yahoo.com** - **Blocked**

## 📋 **Features Implemented**

### **Backend Features**
- ✅ **Google OAuth Strategy** with Passport.js
- ✅ **Domain Validation** (@klh.edu.in only)
- ✅ **User Creation** from Google profile
- ✅ **JWT Token Generation** for authenticated users
- ✅ **Mobile OAuth Support** for React Native apps
- ✅ **Session Management** with express-session

### **Frontend Features**
- ✅ **Google Sign-In Button** with KLH branding
- ✅ **Loading States** during authentication
- ✅ **Error Handling** for failed authentication
- ✅ **Automatic Navigation** after successful login
- ✅ **Responsive Design** for all screen sizes

### **User Management**
- ✅ **Auto-creation** of users from Google profile
- ✅ **Role Assignment** (default: student)
- ✅ **Email Verification** (Google accounts are pre-verified)
- ✅ **Profile Integration** with Google data

## 🛠️ **API Endpoints**

### **Web OAuth**
```
GET  /api/auth/google              # Initiate Google OAuth
GET  /api/auth/google/callback     # OAuth callback (redirects to frontend)
```

### **Mobile OAuth**
```
GET  /api/auth/google/mobile       # Get OAuth URL for mobile
POST /api/auth/google/mobile/callback # Complete mobile OAuth
```

## 🔍 **Testing Checklist**

### **Setup Verification**
- [ ] Google Cloud Console project created
- [ ] OAuth credentials obtained
- [ ] Environment variables configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed

### **Authentication Testing**
- [ ] Google sign-in button appears on login page
- [ ] Clicking button opens Google OAuth
- [ ] Only @klh.edu.in emails are accepted
- [ ] User is created automatically after OAuth
- [ ] JWT token is generated and stored
- [ ] User is redirected to dashboard after login

### **Error Scenarios**
- [ ] Invalid domain shows error message
- [ ] OAuth cancellation handled gracefully
- [ ] Network errors show appropriate feedback

## 🚨 **Security Considerations**

1. **Domain Restriction**: Only @klh.edu.in emails allowed
2. **HTTPS Required**: Use HTTPS in production
3. **Token Security**: JWT tokens are properly signed
4. **Session Management**: Secure session configuration
5. **Input Validation**: All inputs properly validated

## 🔄 **Production Deployment**

For production deployment:

1. **Update Environment Variables**
   ```bash
   GOOGLE_CLIENT_ID=your_production_client_id
   GOOGLE_CLIENT_SECRET=your_production_secret
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   CLIENT_URL=https://yourdomain.com
   NODE_ENV=production
   ```

2. **Enable Production OAuth**
   - Update Google OAuth redirect URIs in console
   - Use production domain instead of localhost

3. **Security Headers**
   - HTTPS only
   - Secure cookies
   - CORS properly configured

## 📱 **Mobile App Integration**

The Google authentication works on both:
- **Web Browser** (immediate testing)
- **Mobile Phone** (via Expo Go or built app)
- **Cross-platform** compatibility maintained

## 🎉 **Ready to Test!**

1. **Set up Google OAuth credentials** in Google Cloud Console
2. **Update backend/.env** with your credentials
3. **Start backend**: `cd backend && npm run dev`
4. **Start frontend**: `cd smart-campus-expo && npx expo start`
5. **Test Google sign-in** with @klh.edu.in email

**The Google authentication system is now fully integrated and ready for KLH University users!** 🎓✨

---

**Note**: Make sure to replace the placeholder values in the `.env` file with your actual Google OAuth credentials from the Google Cloud Console.
