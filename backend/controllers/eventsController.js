const Event = require('../models/Event');
const User = require('../models/User');
const { paginateResults, formatDate } = require('../utils/helpers');
const { notifyAdmins, notifyEventCreator } = require('../utils/notifications');

class EventsController {
  async getEvents(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sort = 'startDate',
        status = 'upcoming'
      } = req.query;

      let query = {};

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by status (upcoming, past, ongoing)
      const now = new Date();
      switch (status) {
        case 'upcoming':
          query.startDate = { $gte: now };
          break;
        case 'past':
          query.endDate = { $lt: now };
          break;
        case 'ongoing':
          query.startDate = { $lte: now };
          query.endDate = { $gte: now };
          break;
      }

      query.isActive = true;

      const events = await paginateResults(
        Event.find(query)
          .populate('organizer', 'firstName lastName email')
          .populate('club', 'name')
          .sort({ [sort]: 1 }),
        page,
        limit
      );

      const total = await Event.countDocuments(query);

      res.json({
        events,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getEventById(req, res) {
    try {
      const event = await Event.findById(req.params.id)
        .populate('organizer', 'firstName lastName email department')
        .populate('club', 'name description')
        .populate('attendees.user', 'firstName lastName email');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ event });
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createEvent(req, res) {
    try {
      const eventData = {
        ...req.body,
        organizer: req.user._id,
        isApproved: req.user.role === 'admin' // Auto-approve for admins
      };

      const event = new Event(eventData);
      await event.save();

      // Populate the event for response
      await event.populate('organizer', 'firstName lastName email');

      // Send notification to admins if not auto-approved
      if (!event.isApproved) {
        await notifyAdmins(
          'New Event Pending Approval',
          'A new event has been submitted and requires your approval.',
          {
            title: event.title,
            description: event.description,
            category: event.category,
            submittedBy: `${req.user.firstName} ${req.user.lastName}`,
            link: `${process.env.CLIENT_URL}/admin/approvals`
          }
        );
      }

      // Emit real-time update
      global.io.emit('new-event', event);

      res.status(201).json({ 
        message: event.isApproved 
          ? 'Event created successfully' 
          : 'Event created and pending approval',
        event 
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('organizer', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('event-updated', updatedEvent);

      res.json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Event.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('event-deleted', { eventId: req.params.id });

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async registerForEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if event is full
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }

      // Check if user is already registered
      const isRegistered = event.attendees.some(
        attendee => attendee.user.toString() === req.user._id.toString()
      );

      if (isRegistered) {
        return res.status(400).json({ message: 'Already registered for this event' });
      }

      // Check registration deadline
      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        return res.status(400).json({ message: 'Registration deadline has passed' });
      }

      event.attendees.push({
        user: req.user._id,
        status: 'registered'
      });

      await event.save();
      await event.populate('attendees.user', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('event-registration', { eventId: event._id, userId: req.user._id });

      res.json({ message: 'Successfully registered for the event', event });
    } catch (error) {
      console.error('Register for event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async unregisterFromEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Remove user from attendees
      event.attendees = event.attendees.filter(
        attendee => attendee.user.toString() !== req.user._id.toString()
      );

      await event.save();

      // Emit real-time update
      global.io.emit('event-unregistration', { eventId: event._id, userId: req.user._id });

      res.json({ message: 'Successfully unregistered from the event' });
    } catch (error) {
      console.error('Unregister from event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getUserEvents(req, res) {
    try {
      const { page = 1, limit = 10, status = 'all' } = req.query;

      let query = { 'attendees.user': req.user._id };

      if (status !== 'all') {
        const now = new Date();
        switch (status) {
          case 'upcoming':
            query.startDate = { $gte: now };
            break;
          case 'past':
            query.endDate = { $lt: now };
            break;
          case 'ongoing':
            query.startDate = { $lte: now };
            query.endDate = { $gte: now };
            break;
        }
      }

      const events = await paginateResults(
        Event.find(query)
          .populate('organizer', 'firstName lastName email')
          .populate('club', 'name')
          .sort({ startDate: 1 }),
        page,
        limit
      );

      const total = await Event.countDocuments(query);

      res.json({
        events,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async approveEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id)
        .populate('organizer', 'firstName lastName email');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is admin
      if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Access denied' });
      }

      event.isApproved = true;
      event.approvedBy = req.user._id;
      event.approvedAt = new Date();
      await event.save();

      // Notify event creator
      await notifyEventCreator(
        event,
        'approved',
        `${req.user.firstName} ${req.user.lastName}`
      );

      // Emit real-time update
      global.io.emit('event-approved', event);

      res.json({ message: 'Event approved successfully', event });
    } catch (error) {
      console.error('Approve event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async rejectEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id)
        .populate('organizer', 'firstName lastName email');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is admin
      if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Notify event creator before deletion
      await notifyEventCreator(
        event,
        'rejected',
        `${req.user.firstName} ${req.user.lastName}`
      );

      await Event.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('event-rejected', { eventId: req.params.id });

      res.json({ message: 'Event rejected and removed' });
    } catch (error) {
      console.error('Reject event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getPendingEvents(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Check if user is admin
      if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const events = await paginateResults(
        Event.find({ isApproved: false, isActive: true })
          .populate('organizer', 'firstName lastName email department')
          .sort({ createdAt: -1 }),
        page,
        limit
      );

      const total = await Event.countDocuments({ isApproved: false, isActive: true });

      res.json({
        events,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get pending events error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new EventsController();
