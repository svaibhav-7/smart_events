const express = require('express');
const { body } = require('express-validator');
const eventsController = require('../controllers/eventsController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', eventsController.getEvents);
router.get('/:id', eventsController.getEventById);

// Protected routes
router.post('/', auth, eventsController.createEvent);
router.put('/:id', auth, eventsController.updateEvent);
router.delete('/:id', auth, eventsController.deleteEvent);

// Event registration
router.post('/:id/register', auth, eventsController.registerForEvent);
router.delete('/:id/register', auth, eventsController.unregisterFromEvent);

// User events
router.get('/user/events', auth, eventsController.getUserEvents);

module.exports = router;
