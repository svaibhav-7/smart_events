# Smart Campus Mobile App - Development Setup Guide

This guide covers setting up the React Native development environment for Windows.

## 🚀 Option 1: Full React Native Setup (Recommended for Development)

### Prerequisites
- **Node.js** (v16 or higher) - https://nodejs.org/
- **Java JDK** (v11 or higher) - https://www.oracle.com/java/technologies/downloads/
- **Android Studio** - https://developer.android.com/studio

### Step-by-Step Setup

#### 1. Install Android Studio
```bash
# Download and install Android Studio from the official website
# Follow the installation wizard
```

#### 2. Configure Android SDK
1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. In **SDK Platforms**, install:
   - Android 12.0 (S) or Android 11.0 (R)
   - Android SDK Platform 30 or 31
4. In **SDK Tools**, install:
   - Android SDK Build-Tools 30.0.3 or higher
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (if using Intel CPU)

#### 3. Set Environment Variables
```powershell
# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools;" +
           "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\emulator;" +
           "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\tools;" +
           "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\tools\bin"

[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
```

#### 4. Create Android Virtual Device (AVD)
1. Open Android Studio
2. Go to **Tools > AVD Manager**
3. Click **Create Virtual Device**
4. Choose a device (e.g., Pixel 4)
5. Download a system image (recommended: R or S)
6. Create the AVD

#### 5. Verify Setup
```bash
# Restart your terminal/command prompt
react-native doctor
adb devices
emulator -list-avds
```

#### 6. Run the Mobile App
```bash
cd mobile
npm run android
```

## 📱 Option 2: Expo Development (Easier Alternative)

If the full React Native setup is too complex, use Expo for easier development.

### Setup Expo
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Create a new Expo project (optional - if you want to convert existing project)
npx create-expo-app smart-campus-expo

# For existing project, add Expo compatibility
cd mobile
npm install expo
npx expo install react-native-screens react-native-safe-area-context
```

### Run with Expo
```bash
cd mobile
npx expo start

# This will show a QR code
# Install Expo Go app on your phone
# Scan the QR code to run the app
```

### Convert Existing React Native to Expo
If you want to use Expo with the existing project:

1. **Install Expo SDK:**
```bash
npm install expo
```

2. **Update App.js:**
```javascript
// Add this import at the top
import { registerRootComponent } from 'expo';

import App from './App';

// register it with Expo
registerRootComponent(App);
```

3. **Install required dependencies:**
```bash
npx expo install react-native-screens react-native-safe-area-context
```

## 🔧 Option 3: Web Development (Quickest)

For quick testing without mobile setup:

```bash
cd mobile
npm install
npm run web
```

This will run the app in a web browser.

## 🛠️ Troubleshooting

### Common Issues

#### 1. "adb is not recognized"
**Solution:** Add Android platform-tools to PATH
```powershell
# Add this to your PATH environment variable
%ANDROID_HOME%\platform-tools
```

#### 2. "No emulators found"
**Solution:** Create an Android Virtual Device
1. Open Android Studio
2. Tools > AVD Manager
3. Create Virtual Device
4. Download system image
5. Start the emulator

#### 3. "Java JDK not found"
**Solution:** Install Java JDK 11+
```bash
# Download from: https://www.oracle.com/java/technologies/downloads/
# Or use OpenJDK: https://openjdk.java.net/install/
```

#### 4. Metro bundler issues
**Solution:** Clear cache
```bash
cd mobile
npm start -- --reset-cache
```

#### 5. Port already in use
**Solution:** Kill existing processes
```bash
# Find and kill process using port 8081
netstat -ano | findstr :8081
taskkill /PID <PID_NUMBER> /F

# Or use different port
npm start -- --port 8082
```

### Manual Environment Setup

#### Windows Environment Variables
1. Open **System Properties** > **Environment Variables**
2. Add **ANDROID_HOME**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\%USERNAME%\AppData\Local\Android\Sdk`

3. Edit **PATH** variable and add:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

#### Verify Installation
```bash
# Check Java
java -version

# Check Node.js
node --version

# Check Android SDK
adb version

# Check emulator
emulator -list-avds

# Check React Native
react-native --version
```

## 📋 Development Commands

```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web

# Clear cache
npm start -- --reset-cache

# Run tests
npm test

# Build for production
npm run build
```

## 🔄 Alternative: Use Physical Device

1. **Enable Developer Options:**
   - Go to Settings > About phone
   - Tap "Build number" 7 times
   - Go back to Settings > Developer options
   - Enable "USB debugging"

2. **Connect Device:**
   - Connect phone via USB
   - Allow USB debugging when prompted
   - Run: `npm run android`

3. **Wireless Debugging (Android 11+):**
   - Enable "Wireless debugging" in Developer options
   - Pair device with computer
   - Run: `npm run android`

## 🎯 Recommended Development Flow

1. **For Quick Testing:** Use Expo Go app
2. **For Full Development:** Set up Android Studio + AVD
3. **For Production:** Test on physical devices
4. **For Web Testing:** Use `npm run web`

## 📚 Resources

- **React Native Documentation:** https://reactnative.dev/
- **Expo Documentation:** https://docs.expo.dev/
- **Android Development:** https://developer.android.com/
- **React Native CLI:** https://github.com/react-native-community/cli

---

**Note:** The full React Native setup can be complex on Windows. If you encounter issues, consider starting with Expo for easier development, then migrate to full React Native once everything is working.

Would you like me to help you with any specific step in the setup process?
