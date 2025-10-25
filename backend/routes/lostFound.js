const express = require('express');
const { body } = require('express-validator');
const lostFoundController = require('../controllers/lostFoundController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', lostFoundController.getItems);
router.get('/:id', lostFoundController.getItemById);

// Protected routes
router.post('/', auth, lostFoundController.createItem);
router.put('/:id', auth, lostFoundController.updateItem);
router.delete('/:id', auth, lostFoundController.deleteItem);

// Item actions
router.post('/:id/claim', auth, lostFoundController.claimItem);
router.post('/:id/resolve', auth, lostFoundController.markResolved);

module.exports = router;
