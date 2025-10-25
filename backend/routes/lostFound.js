const express = require('express');
const { body } = require('express-validator');
const lostFoundController = require('../controllers/lostFoundController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', lostFoundController.getItems);
router.get('/statistics', lostFoundController.getStatistics);
router.get('/:id', lostFoundController.getItemById);
router.get('/:id/suggestions', lostFoundController.getSuggestions);

// Protected routes
router.get('/user/items', auth, lostFoundController.getUserItems);
router.post('/', auth, lostFoundController.createItem);
router.put('/:id', auth, lostFoundController.updateItem);
router.delete('/:id', auth, lostFoundController.deleteItem);

// Item actions
router.post('/:id/claim', auth, lostFoundController.claimItem);
router.post('/:id/resolve', auth, lostFoundController.markResolved);
router.post('/:id/match', auth, lostFoundController.matchItems);

module.exports = router;
