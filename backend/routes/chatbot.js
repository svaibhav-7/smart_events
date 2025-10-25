const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public route (optional auth)
router.post('/', optionalAuth, chatbotController.sendMessage);

module.exports = router;
