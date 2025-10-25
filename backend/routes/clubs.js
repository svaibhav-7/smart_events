const express = require('express');
const { body } = require('express-validator');
const clubsController = require('../controllers/clubsController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', clubsController.getClubs);

// Admin routes (must come before /:id to avoid route conflicts)
router.get('/pending', auth, clubsController.getPendingClubs);
router.post('/:id/approve', auth, clubsController.approveClub);
router.post('/:id/reject', auth, clubsController.rejectClub);
router.put('/:clubId/members/:memberId', auth, clubsController.updateMemberRole);

// User clubs route
router.get('/user/clubs', auth, clubsController.getUserClubs);

// Single club route (must come after specific routes)
router.get('/:id', clubsController.getClubById);

// Protected routes
router.post('/', auth, clubsController.createClub);
router.put('/:id', auth, clubsController.updateClub);
router.delete('/:id', auth, clubsController.deleteClub);

// Club membership
router.post('/:id/join', auth, clubsController.joinClub);
router.delete('/:id/join', auth, clubsController.leaveClub);

module.exports = router;
