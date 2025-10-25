const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { paginateResults } = require('../utils/helpers');

class FeedbackController {
  async getFeedback(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        department,
        priority,
        status,
        search,
        sort = 'createdAt'
      } = req.query;

      let query = {};

      // Users can only see their own feedback unless they're faculty/admin
      if (req.user.role === 'student') {
        query.submittedBy = req.user._id;
      }

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Filter by department
      if (department && department !== 'all') {
        query.department = department;
      }

      // Filter by priority
      if (priority && priority !== 'all') {
        query.priority = priority;
      }

      // Filter by status
      if (status && status !== 'all') {
        query.status = status;
      }

      // Text search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const feedback = await paginateResults(
        Feedback.find(query)
          .populate('submittedBy', 'firstName lastName email department')
          .populate('assignedTo', 'firstName lastName email')
          .populate('responses.respondedBy', 'firstName lastName email')
          .sort({ [sort]: -1 }),
        page,
        limit
      );

      const total = await Feedback.countDocuments(query);

      res.json({
        feedback,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getPublicFeedback(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        department,
        sort = 'createdAt'
      } = req.query;

      let query = { isPublic: true };

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Filter by department
      if (department && department !== 'all') {
        query.department = department;
      }

      const feedback = await paginateResults(
        Feedback.find(query)
          .populate('submittedBy', 'firstName lastName department')
          .sort({ [sort]: -1 }),
        page,
        limit
      );

      const total = await Feedback.countDocuments(query);

      res.json({
        feedback,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get public feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getFeedbackById(req, res) {
    try {
      const feedback = await Feedback.findById(req.params.id)
        .populate('submittedBy', 'firstName lastName email department')
        .populate('assignedTo', 'firstName lastName email')
        .populate('responses.respondedBy', 'firstName lastName email')
        .populate('upvotes', 'firstName lastName')
        .populate('downvotes', 'firstName lastName');

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user can view this feedback
      const canView =
        feedback.submittedBy._id.toString() === req.user._id.toString() ||
        req.user.role === 'faculty' ||
        req.user.role === 'admin' ||
        feedback.isPublic;

      if (!canView) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ feedback });
    } catch (error) {
      console.error('Get feedback by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createFeedback(req, res) {
    try {
      const feedbackData = {
        ...req.body,
        submittedBy: req.user._id
      };

      const feedback = new Feedback(feedbackData);
      await feedback.save();

      await feedback.populate('submittedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('new-feedback', feedback);

      res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
      console.error('Create feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateFeedback(req, res) {
    try {
      const feedback = await Feedback.findById(req.params.id);

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user is the submitter
      if (feedback.submittedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if feedback is still open
      if (feedback.status !== 'open') {
        return res.status(400).json({ message: 'Cannot update closed feedback' });
      }

      const updatedFeedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('submittedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('feedback-updated', updatedFeedback);

      res.json({ message: 'Feedback updated successfully', feedback: updatedFeedback });
    } catch (error) {
      console.error('Update feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteFeedback(req, res) {
    try {
      const feedback = await Feedback.findById(req.params.id);

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user is the submitter or admin
      if (feedback.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Feedback.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('feedback-deleted', { feedbackId: req.params.id });

      res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      console.error('Delete feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async addResponse(req, res) {
    try {
      const feedback = await Feedback.findById(req.params.id);

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user is faculty or admin
      if (req.user.role === 'student') {
        return res.status(403).json({ message: 'Access denied' });
      }

      feedback.responses.push({
        response: req.body.response,
        respondedBy: req.user._id
      });

      // Update status if it was the first response
      if (feedback.status === 'open') {
        feedback.status = 'in-progress';
        feedback.assignedTo = req.user._id;
      }

      await feedback.save();
      await feedback.populate('responses.respondedBy', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('feedback-response', feedback);

      res.json({ message: 'Response added successfully', feedback });
    } catch (error) {
      console.error('Add response error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async voteFeedback(req, res) {
    try {
      const { voteType } = req.body; // 'up' or 'down'
      const feedback = await Feedback.findById(req.params.id);

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Remove existing votes by this user
      feedback.upvotes = feedback.upvotes.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      feedback.downvotes = feedback.downvotes.filter(
        userId => userId.toString() !== req.user._id.toString()
      );

      // Add new vote
      if (voteType === 'up') {
        feedback.upvotes.push(req.user._id);
      } else if (voteType === 'down') {
        feedback.downvotes.push(req.user._id);
      }

      await feedback.save();
      await feedback.populate('upvotes', 'firstName lastName');
      await feedback.populate('downvotes', 'firstName lastName');

      res.json({ message: 'Vote recorded successfully', feedback });
    } catch (error) {
      console.error('Vote feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new FeedbackController();
