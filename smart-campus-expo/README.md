# Smart Campus - Expo Mobile App

A React Native mobile application built with Expo for the Smart Campus Ecosystem.

## 🚀 Quick Start with Expo (Windows Compatible)

### Prerequisites
- **Node.js** (v16 or higher) - https://nodejs.org/
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **Expo Go App** - Download from App Store/Google Play

### Setup Instructions

#### 1. Install Dependencies
```bash
cd smart-campus-expo
npm install
```

#### 2. Start the Development Server
```bash
npx expo start
```

#### 3. Run on Your Device
**Option A: Use Expo Go App (Recommended)**
1. Install **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. The app will load on your phone instantly!

**Option B: Run on Web Browser**
```bash
npx expo start --web
```

**Option C: Run on Android Emulator**
```bash
npx expo start --android
```

### 📱 Features

#### ✅ **Authentication**
- Login and registration
- Role-based access (Student, Faculty, Admin)
- Secure token management

#### ✅ **Dashboard**
- Welcome screen with user info
- Quick action cards
- Campus statistics overview
- Role-based feature access

#### ✅ **Navigation**
- Bottom tab navigation
- Clean, intuitive interface
- Material Design components

#### ✅ **Responsive Design**
- Works on all screen sizes
- Optimized for mobile devices
- Consistent user experience

### 🛠️ Development

#### Project Structure
```
smart-campus-expo/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── navigation/           # Navigation components
│   ├── AppNavigator.js   # Main navigation logic
│   ├── AuthNavigator.js  # Authentication flow
│   └── MainNavigator.js  # Main app navigation
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication state
└── screens/             # Screen components
    ├── LoginScreen.js   # Login screen
    ├── RegisterScreen.js # Registration screen
    ├── DashboardScreen.js # Main dashboard
    ├── EventsScreen.js   # Events placeholder
    ├── LostFoundScreen.js # Lost & Found placeholder
    ├── ClubsScreen.js    # Clubs placeholder
    └── ProfileScreen.js  # User profile
```

#### Available Scripts
```bash
# Start development server
npm start

# Start with web browser
npm run web

# Start with Android
npm run android

# Start with iOS (macOS only)
npm run ios

# Clear cache
npx expo start --clear
```

### 🔧 Backend Integration

The app connects to the Smart Campus backend API:
- **Base URL:** `http://localhost:5000/api`
- **Authentication:** JWT tokens stored securely
- **Real-time updates:** WebSocket support ready

### 📱 Testing

#### 1. Web Browser (Easiest)
```bash
npx expo start --web
```
- No additional setup required
- Test all features instantly
- Perfect for development

#### 2. Physical Device (Recommended)
1. Install **Expo Go** app
2. Scan QR code from terminal
3. Test on real device

#### 3. Android Emulator
```bash
# Requires Android Studio setup
npx expo start --android
```

### 🎯 Production Build

#### For App Store/Google Play
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or use EAS Build (recommended)
npm install -g @expo/eas-cli
eas build --platform android
```

### 🔄 Converting from React Native CLI

If you have the original React Native project:

1. **Copy screens** from `mobile/src/screens/` to `smart-campus-expo/screens/`
2. **Update imports** to use Expo-compatible paths
3. **Replace navigation** with React Navigation 6
4. **Update API calls** to use the backend endpoints

### 📚 Key Differences from React Native CLI

#### ✅ **Advantages of Expo**
- **No Android Studio required** for basic development
- **Instant updates** - no rebuilding for code changes
- **Easy sharing** - just scan QR code
- **Built-in services** - push notifications, updates, etc.
- **Cross-platform** - works on iOS, Android, and Web

#### ⚠️ **Considerations**
- **Limited native modules** - some features need ejecting
- **App size** - slightly larger due to Expo SDK
- **Network dependency** - requires internet for some features

### 🚀 Deployment Options

#### 1. Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure project
eas build:configure

# Build for stores
eas build --platform android
eas build --platform ios
```

#### 2. Standalone App
```bash
# Eject from Expo (if needed for custom native code)
npx expo eject

# Then use standard React Native build process
```

### 📞 Support

For issues with Expo:
- **Documentation:** https://docs.expo.dev/
- **Community:** https://forums.expo.dev/
- **GitHub Issues:** https://github.com/expo/expo/issues

---

## 🎉 **Ready to Test!**

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Expo:** `cd smart-campus-expo && npx expo start`
3. **Scan QR Code** with Expo Go app on your phone
4. **Test Features:** Login, dashboard, navigation

**The Expo app is much easier to set up on Windows and provides the same functionality as the full React Native app!** 📱✨
