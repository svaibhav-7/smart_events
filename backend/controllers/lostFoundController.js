const LostFound = require('../models/LostFound');
const User = require('../models/User');
const { paginateResults, calculateDistance } = require('../utils/helpers');

class LostFoundController {
  async getItems(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        itemType,
        location,
        search,
        sort = 'createdAt',
        status = 'open',
        latitude,
        longitude,
        radius = 5
      } = req.query;

      let query = {};

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Filter by item type
      if (itemType && itemType !== 'all') {
        query.itemType = itemType;
      }

      // Filter by status
      if (status && status !== 'all') {
        query.status = status;
      }

      // Location-based search
      if (latitude && longitude) {
        const nearbyItems = await LostFound.find({
          coordinates: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
              },
              $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
            }
          }
        });

        const nearbyIds = nearbyItems.map(item => item._id);
        query._id = { $in: nearbyIds };
      }

      // Text search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const items = await paginateResults(
        LostFound.find(query)
          .populate('reportedBy', 'firstName lastName email')
          .populate('claimedBy', 'firstName lastName email')
          .sort({ [sort]: -1 }),
        page,
        limit
      );

      const total = await LostFound.countDocuments(query);

      res.json({
        items,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get lost & found items error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getItemById(req, res) {
    try {
      const item = await LostFound.findById(req.params.id)
        .populate('reportedBy', 'firstName lastName email department')
        .populate('claimedBy', 'firstName lastName email');

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.json({ item });
    } catch (error) {
      console.error('Get item by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createItem(req, res) {
    try {
      const itemData = {
        ...req.body,
        reportedBy: req.user._id
      };

      // Add coordinates if location is provided
      if (itemData.coordinates) {
        itemData.coordinates = {
          latitude: itemData.coordinates.latitude,
          longitude: itemData.coordinates.longitude
        };
      }

      const item = new LostFound(itemData);
      await item.save();

      await item.populate('reportedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('lost-found-update', item);

      res.status(201).json({ message: 'Item reported successfully', item });
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateItem(req, res) {
    try {
      const item = await LostFound.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if user is the reporter or admin
      if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedItem = await LostFound.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('reportedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('lost-found-update', updatedItem);

      res.json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteItem(req, res) {
    try {
      const item = await LostFound.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if user is the reporter or admin
      if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await LostFound.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('lost-found-deleted', { itemId: req.params.id });

      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async claimItem(req, res) {
    try {
      const item = await LostFound.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.status !== 'open') {
        return res.status(400).json({ message: 'Item is not available for claiming' });
      }

      // Check if user is trying to claim their own item
      if (item.reportedBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot claim your own item' });
      }

      item.status = 'claimed';
      item.claimedBy = req.user._id;
      item.claimedAt = new Date();

      await item.save();
      await item.populate('claimedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('lost-found-claimed', item);

      res.json({ message: 'Item claimed successfully', item });
    } catch (error) {
      console.error('Claim item error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async markResolved(req, res) {
    try {
      const item = await LostFound.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if user is the reporter, claimer, or admin
      const canResolve =
        item.reportedBy.toString() === req.user._id.toString() ||
        (item.claimedBy && item.claimedBy.toString() === req.user._id.toString()) ||
        req.user.role === 'admin';

      if (!canResolve) {
        return res.status(403).json({ message: 'Access denied' });
      }

      item.status = 'resolved';
      item.resolvedBy = req.user._id;
      item.resolvedAt = new Date();

      await item.save();

      // Emit real-time update
      global.io.emit('lost-found-resolved', item);

      res.json({ message: 'Item marked as resolved', item });
    } catch (error) {
      console.error('Mark resolved error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new LostFoundController();
