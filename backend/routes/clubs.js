const express = require('express');
const { body } = require('express-validator');
const clubsController = require('../controllers/clubsController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', clubsController.getClubs);
router.get('/:id', clubsController.getClubById);

// Protected routes
router.post('/', auth, clubsController.createClub);
router.put('/:id', auth, clubsController.updateClub);
router.delete('/:id', auth, clubsController.deleteClub);

// Club membership
router.post('/:id/join', auth, clubsController.joinClub);
router.delete('/:id/join', auth, clubsController.leaveClub);

// User clubs
router.get('/user/clubs', auth, clubsController.getUserClubs);

// Admin routes
router.put('/:clubId/members/:memberId', auth, clubsController.updateMemberRole);
router.get('/pending', auth, clubsController.getPendingClubs);
router.post('/:id/approve', auth, clubsController.approveClub);
router.post('/:id/reject', auth, clubsController.rejectClub);

module.exports = router;
