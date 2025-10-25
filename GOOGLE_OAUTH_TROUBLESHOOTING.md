# Google OAuth Troubleshooting Guide

## ❌ Error: `redirect_uri_mismatch`

### **What This Means:**
Google is blocking the authentication because the redirect URI (`http://localhost:5000/api/auth/google/callback`) is not registered in your Google Cloud Console.

---

## ✅ **SOLUTION: Register Redirect URI**

### **Step-by-Step Instructions:**

#### **1. Open Google Cloud Console**
- Go to: https://console.cloud.google.com/
- Make sure you're logged in with the account that created the OAuth credentials

#### **2. Navigate to Credentials**
- Click on the menu (☰) in top-left
- Go to: **APIs & Services** → **Credentials**

#### **3. Find Your OAuth Client**
- Look for **OAuth 2.0 Client IDs** section
- Find the client with ID: `851768372235-1v32318dl93kn34dsn9jjusctm00u908`
- It might be named "Web client" or similar

#### **4. Edit the OAuth Client**
- Click the **pencil icon** (✏️) or the name to edit

#### **5. Add Authorized Redirect URIs**
Scroll down to the **"Authorized redirect URIs"** section

Click **"+ ADD URI"** and add each of these:

```
http://localhost:5000/api/auth/google/callback
http://127.0.0.1:5000/api/auth/google/callback
http://localhost:3000/auth/google/callback
```

#### **6. Save Changes**
- Click **"SAVE"** at the bottom of the page
- Wait 5-10 minutes for changes to propagate

---

## 🔍 **Verify Your Configuration**

### **Current Settings in `.env` file:**
```env
GOOGLE_CLIENT_ID=851768372235-1v32318dl93kn34dsn9jjusctm00u908.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ALLOWED_EMAIL_DOMAIN=klh.edu.in
CLIENT_URL=http://localhost:3000
```

### **Required Redirect URIs in Google Cloud:**
✅ `http://localhost:5000/api/auth/google/callback`
✅ `http://127.0.0.1:5000/api/auth/google/callback`
✅ `http://localhost:3000/auth/google/callback` (optional, for direct frontend redirects)

---

## 🧪 **Testing After Configuration**

### **1. Restart Backend Server**
```powershell
# Stop the server (Ctrl+C)
cd backend
npm run dev
```

### **2. Clear Browser Cache**
- Press `Ctrl+Shift+Delete`
- Clear cookies and cached images
- Or use Incognito/Private mode

### **3. Test Google Login**
- Go to: http://localhost:3000/login
- Click **"Continue with Google (@klh.edu.in)"**
- You should now be redirected to Google login

---

## 📋 **Common Issues & Solutions**

### **Issue 1: Still Getting `redirect_uri_mismatch`**
**Solution:**
- Double-check the URIs are **exactly** as shown above
- No trailing slashes
- Correct protocol (`http://` not `https://`)
- Wait 5-10 minutes after saving in Google Cloud Console

### **Issue 2: "Access blocked: This app's request is invalid"**
**Solution:**
- Make sure OAuth consent screen is configured
- Add test users if app is in "Testing" mode
- Go to: APIs & Services → OAuth consent screen

### **Issue 3: "Only @klh.edu.in emails allowed"**
**Solution:**
- This is intentional! The app only accepts KLH University emails
- Use an email ending with `@klh.edu.in`
- Or change `ALLOWED_EMAIL_DOMAIN` in `.env` file for testing

---

## 🎯 **Quick Verification Checklist**

Before testing, verify:

- [ ] Google Cloud Console has the redirect URIs added
- [ ] OAuth consent screen is configured
- [ ] `.env` file has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Browser cache is cleared or using incognito mode
- [ ] Waited 5-10 minutes after Google Cloud changes

---

## 🔗 **Useful Links**

- **Google Cloud Console:** https://console.cloud.google.com/
- **OAuth Credentials:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent

---

## 📞 **Need Help?**

If you're still having issues:

1. Check the backend console for error messages
2. Check browser console (F12) for errors
3. Verify the exact error message from Google
4. Make sure you're using a `@klh.edu.in` email for testing

---

## ✨ **After Successful Setup**

Once working, you'll see:
1. Google sign-in popup
2. Account selection (if multiple Google accounts)
3. Permission request screen
4. Automatic redirect back to your app
5. You're logged in!

**Good luck! 🚀**
