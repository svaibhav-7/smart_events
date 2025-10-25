const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { paginateResults } = require('../utils/helpers');

class AnnouncementsController {
  async getAnnouncements(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        priority,
        search,
        sort = 'createdAt',
        targetAudience = 'all'
      } = req.query;

      let query = {};

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Filter by priority
      if (priority && priority !== 'all') {
        query.priority = priority;
      }

      // Text search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by target audience
      if (targetAudience !== 'all') {
        query.targetAudience = targetAudience;
      }

      // Show only active announcements (not expired)
      query.isActive = true;
      query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];

      const announcements = await paginateResults(
        Announcement.find(query)
          .populate('postedBy', 'firstName lastName email department')
          .populate('approvedBy', 'firstName lastName email')
          .sort({ [sort]: -1 }),
        page,
        limit
      );

      const total = await Announcement.countDocuments(query);

      res.json({
        announcements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAnnouncementById(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id)
        .populate('postedBy', 'firstName lastName email department')
        .populate('approvedBy', 'firstName lastName email');

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Mark as read if user is authenticated
      if (req.user) {
        const alreadyRead = announcement.readBy.some(
          read => read.user.toString() === req.user._id.toString()
        );

        if (!alreadyRead) {
          announcement.readBy.push({
            user: req.user._id,
            readAt: new Date()
          });
          announcement.views += 1;
          await announcement.save();
        }
      }

      res.json({ announcement });
    } catch (error) {
      console.error('Get announcement by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createAnnouncement(req, res) {
    try {
      const announcementData = {
        ...req.body,
        postedBy: req.user._id
      };

      const announcement = new Announcement(announcementData);
      await announcement.save();

      await announcement.populate('postedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('new-announcement', announcement);

      res.status(201).json({ message: 'Announcement created successfully', announcement });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateAnnouncement(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Check if user is the poster or admin
      if (announcement.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('postedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('announcement-updated', updatedAnnouncement);

      res.json({ message: 'Announcement updated successfully', announcement: updatedAnnouncement });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteAnnouncement(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Check if user is the poster or admin
      if (announcement.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Announcement.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('announcement-deleted', { announcementId: req.params.id });

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async markAsRead(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Check if already read
      const alreadyRead = announcement.readBy.some(
        read => read.user.toString() === req.user._id.toString()
      );

      if (!alreadyRead) {
        announcement.readBy.push({
          user: req.user._id,
          readAt: new Date()
        });
        announcement.views += 1;
        await announcement.save();
      }

      res.json({ message: 'Marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AnnouncementsController();
