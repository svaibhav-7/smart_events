const express = require('express');
const { body } = require('express-validator');
const eventsController = require('../controllers/eventsController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes with optional auth
router.get('/', optionalAuth, eventsController.getEvents);

// Admin approval routes (must come before /:id to avoid route conflicts)
router.get('/pending', auth, eventsController.getPendingEvents);
router.post('/:id/approve', auth, eventsController.approveEvent);
router.post('/:id/reject', auth, eventsController.rejectEvent);

// User events route
router.get('/user/events', auth, eventsController.getUserEvents);

// Single event route (must come after specific routes)
router.get('/:id', eventsController.getEventById);

// Protected routes
router.post('/', auth, eventsController.createEvent);
router.put('/:id', auth, eventsController.updateEvent);
router.delete('/:id', auth, eventsController.deleteEvent);

// Event registration
router.post('/:id/register', auth, eventsController.registerForEvent);
router.delete('/:id/register', auth, eventsController.unregisterFromEvent);

module.exports = router;
