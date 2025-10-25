const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
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

// FCM Token management
router.post('/fcm-token', auth, authController.updateFcmToken);

module.exports = router;
