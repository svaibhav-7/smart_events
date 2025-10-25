const express = require('express');
const { body } = require('express-validator');
const announcementsController = require('../controllers/announcementsController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes with optional auth
router.get('/', optionalAuth, announcementsController.getAnnouncements);
router.get('/:id', announcementsController.getAnnouncementById);

// Protected routes
router.post('/', auth, announcementsController.createAnnouncement);
router.put('/:id', auth, announcementsController.updateAnnouncement);
router.delete('/:id', auth, announcementsController.deleteAnnouncement);

// Announcement actions
router.post('/:id/read', auth, announcementsController.markAsRead);

module.exports = router;
