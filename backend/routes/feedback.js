const express = require('express');
const { body } = require('express-validator');
const feedbackController = require('../controllers/feedbackController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (for viewing public feedback)
router.get('/public', feedbackController.getPublicFeedback);

// Protected routes
router.get('/', auth, feedbackController.getFeedback);
router.get('/:id', auth, feedbackController.getFeedbackById);
router.post('/', auth, feedbackController.createFeedback);
router.put('/:id', auth, feedbackController.updateFeedback);
router.delete('/:id', auth, feedbackController.deleteFeedback);

// Feedback actions
router.post('/:id/response', auth, feedbackController.addResponse);
router.post('/:id/vote', auth, feedbackController.voteFeedback);

module.exports = router;
