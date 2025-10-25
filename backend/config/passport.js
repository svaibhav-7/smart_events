const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (app) => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if email domain is allowed
          const email = profile.emails[0].value;
          const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

          console.log('Google OAuth attempt:');
          console.log('- Email:', email);
          console.log('- Allowed domain:', allowedDomain);

          // Skip domain check if ALLOWED_EMAIL_DOMAIN is empty or not set
          if (allowedDomain && allowedDomain !== '' && !email.endsWith(`@${allowedDomain}`)) {
            console.log('❌ Email domain not allowed:', email);
            return done(null, false, {
              message: `Only @${allowedDomain} email addresses are allowed. Your email: ${email}`
            });
          }

          if (!allowedDomain || allowedDomain === '') {
            console.log('⚠️ Domain restriction disabled - allowing all emails');
          }

          // Auto-detect role from email format
          const detectRoleFromEmail = (email) => {
            if (!email || !email.includes('@')) {
              return 'student';
            }
            
            // Extract the part before @
            const localPart = email.split('@')[0];
            
            // Check if there's a number in the local part (student email pattern)
            const hasNumber = /\d/.test(localPart);
            
            if (hasNumber) {
              return 'student';
            } else {
              // No number = faculty (can be changed by admin later)
              return 'faculty';
            }
          };

          const detectedRole = detectRoleFromEmail(email);
          console.log('🔍 Detected role from email:', detectedRole);

          // Check if user already exists
          let existingUser = await User.findOne({ email: email });

          if (existingUser) {
            console.log('✅ Existing user found:', email);
            // Update Google ID if not set
            if (!existingUser.googleId) {
              existingUser.googleId = profile.id;
              await existingUser.save();
            }
            return done(null, existingUser);
          }

          // Create new user
          console.log('✅ Creating new user:', email, 'with role:', detectedRole);
          const newUser = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: email,
            role: detectedRole, // Auto-detected role
            isVerified: true, // Google accounts are pre-verified
            authProvider: 'google',
          });

          const savedUser = await newUser.save();
          console.log('✅ User created successfully:', email, 'as', detectedRole);
          return done(null, savedUser);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Initialize passport and sessions
  app.use(passport.initialize());
  app.use(passport.session());
};
