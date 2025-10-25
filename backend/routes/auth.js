const express = require('express');
const passport = require('passport');
const axios = require('axios');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, optionalAuth } = require('../middleware/auth');
const { generateToken } = require('../utils/helpers');
const User = require('../models/User');

const router = express.Router();
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['student', 'faculty', 'admin']),
  body('studentId').optional().isAlphanumeric(),
  body('employeeId').optional().isAlphanumeric(),
  body('department').optional().trim(),
  body('year').optional().trim()
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], authController.login);

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], authController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], authController.resetPassword);

router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('any'),
  body('department').optional().trim()
], authController.updateProfile);

router.put('/change-password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], authController.changePassword);

router.post('/logout', auth, authController.logout);

// Admin routes
router.get('/users', auth, authController.getAllUsers);
router.get('/users/:id', auth, authController.getUserById);
router.put('/users/:id/status', auth, authController.updateUserStatus);
router.delete('/users/:id', auth, authController.deleteUser);

// Google OAuth routes
// Debug endpoint to check OAuth configuration
router.get('/google/debug', (req, res) => {
  res.json({
    clientIdConfigured: !!process.env.GOOGLE_CLIENT_ID,
    clientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    allowedDomain: process.env.ALLOWED_EMAIL_DOMAIN || 'Not set (all domains allowed)',
    clientUrl: process.env.CLIENT_URL,
    sessionSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
  });
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Passport authentication error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      
      if (!user) {
        console.error('No user returned from passport:', info);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }

        try {
          // Generate JWT token
          const token = generateToken(user._id);
          
          // Redirect to frontend with token
          const userInfo = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            authProvider: user.authProvider || 'google',
          };

          console.log('Google OAuth successful for:', user.email);
          
          res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
        } catch (error) {
          console.error('Google callback error:', error);
          res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }
      });
    })(req, res, next);
  }
);

// Mobile Google OAuth routes
router.get('/google/mobile', (req, res) => {
  try {
    const redirectUri = req.query.redirectUri;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

    // Create Google OAuth URL
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=profile email&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${allowedDomain}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Mobile Google auth URL error:', error);
    res.status(500).json({ message: 'Failed to generate auth URL' });
  }
});

router.post('/google/mobile/callback', async (req, res) => {
  try {
    const { code, state, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const { access_token } = tokenResponse.data;

    // Get user profile from Google
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileResponse.data;

    // Validate email domain
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
    if (!profile.email.endsWith(`@${allowedDomain}`)) {
      return res.status(403).json({
        message: `Only @${allowedDomain} email addresses are allowed`
      });
    }

    // Check if user exists or create new one
    let user = await User.findOne({ email: profile.email });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId: profile.id,
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        role: 'student',
        isVerified: true,
        authProvider: 'google',
      });
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Mobile Google OAuth callback error:', error);
    res.status(500).json({
      message: error.response?.data?.error || 'Google authentication failed'
    });
  }
});

module.exports = router;
