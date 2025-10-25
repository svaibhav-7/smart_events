@echo off
echo =====================================
echo Google OAuth Configuration Checker
echo =====================================
echo.

echo Current Configuration:
echo ---------------------
echo.

cd backend

echo GOOGLE_CLIENT_ID:
findstr "GOOGLE_CLIENT_ID" .env
echo.

echo GOOGLE_CALLBACK_URL:
findstr "GOOGLE_CALLBACK_URL" .env
echo.

echo CLIENT_URL:
findstr "CLIENT_URL" .env
echo.

echo ALLOWED_EMAIL_DOMAIN:
findstr "ALLOWED_EMAIL_DOMAIN" .env
echo.

echo =====================================
echo NEXT STEPS:
echo =====================================
echo.
echo 1. Go to: https://console.cloud.google.com/apis/credentials
echo.
echo 2. Find OAuth Client: 851768372235-1v32318dl93kn34dsn9jjusctm00u908
echo.
echo 3. Click EDIT and add these Authorized redirect URIs:
echo    - http://localhost:5000/api/auth/google/callback
echo    - http://127.0.0.1:5000/api/auth/google/callback
echo.
echo 4. Click SAVE
echo.
echo 5. Wait 5-10 minutes for changes to take effect
echo.
echo 6. Restart backend: cd backend ; npm run dev
echo.
echo 7. Test at: http://localhost:3000/login
echo.
echo =====================================
echo.

pause
