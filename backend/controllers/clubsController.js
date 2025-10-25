const Club = require('../models/Club');
const User = require('../models/User');
const { paginateResults } = require('../utils/helpers');
const { notifyAdmins, notifyClubCreator } = require('../utils/notifications');

class ClubsController {
  async getClubs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sort = 'name',
        status = 'approved'
      } = req.query;

      let query = {};

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Filter by status
      if (status && status !== 'all') {
        query.isApproved = status === 'approved';
      }

      // Text search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      query.isActive = true;

      const clubs = await paginateResults(
        Club.find(query)
          .populate('advisor', 'firstName lastName email')
          .populate('president', 'firstName lastName email')
          .populate('members.user', 'firstName lastName email')
          .sort({ [sort]: 1 }),
        page,
        limit
      );

      const total = await Club.countDocuments(query);

      res.json({
        clubs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getClubById(req, res) {
    try {
      const club = await Club.findById(req.params.id)
        .populate('advisor', 'firstName lastName email department')
        .populate('president', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email department year')
        .populate('approvedBy', 'firstName lastName email');

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      res.json({ club });
    } catch (error) {
      console.error('Get club by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createClub(req, res) {
    try {
      console.log('Creating club with data:', req.body);
      
      const clubData = {
        ...req.body,
        advisor: req.user._id,
        isApproved: false, // All clubs need approval
        establishedYear: req.body.establishedYear || new Date().getFullYear() // Default to current year
      };

      const club = new Club(clubData);
      await club.save();

      await club.populate('advisor', 'firstName lastName email');

      // Send notification to admins (don't block if it fails)
      try {
        await notifyAdmins(
          'New Club Pending Approval',
          'A new club has been submitted and requires your approval.',
          {
            title: club.name,
            description: club.description,
            category: club.category,
            submittedBy: `${req.user.firstName} ${req.user.lastName}`,
            link: `${process.env.CLIENT_URL}/admin/approvals`
          }
        );
      } catch (notifyError) {
        console.error('Notification error (non-blocking):', notifyError.message);
      }

      // Emit real-time update
      if (global.io) {
        global.io.emit('new-club', club);
      }

      res.status(201).json({ 
        message: 'Club created and pending approval', 
        club 
      });
    } catch (error) {
      console.error('Create club error:', error);
      console.error('Error details:', error.message);
      
      // Send more specific error message
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors 
        });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'A club with this name already exists' 
        });
      }
      
      res.status(500).json({ 
        message: 'Failed to create club',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateClub(req, res) {
    try {
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is advisor, president, or admin
      const isAdvisor = club.advisor.toString() === req.user._id.toString();
      const isPresident = club.president && club.president.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isAdvisor && !isPresident && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedClub = await Club.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('advisor', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('club-updated', updatedClub);

      res.json({ message: 'Club updated successfully', club: updatedClub });
    } catch (error) {
      console.error('Update club error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteClub(req, res) {
    try {
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is advisor or admin
      const isAdvisor = club.advisor.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isAdvisor && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Club.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('club-deleted', { clubId: req.params.id });

      res.json({ message: 'Club deleted successfully' });
    } catch (error) {
      console.error('Delete club error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async joinClub(req, res) {
    try {
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      if (!club.isApproved) {
        return res.status(400).json({ message: 'Club is not approved yet' });
      }

      // Check if club is full
      if (club.maxMembers && club.members.length >= club.maxMembers) {
        return res.status(400).json({ message: 'Club is full' });
      }

      // Check if user is already a member
      const isMember = club.members.some(
        member => member.user.toString() === req.user._id.toString()
      );

      if (isMember) {
        return res.status(400).json({ message: 'Already a member of this club' });
      }

      club.members.push({
        user: req.user._id,
        role: 'member',
        joinedAt: new Date()
      });

      await club.save();
      await club.populate('members.user', 'firstName lastName email');

      // Add club to user's clubs array
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { clubs: club._id }
      });

      // Emit real-time update
      global.io.emit('club-member-joined', { clubId: club._id, userId: req.user._id });

      res.json({ message: 'Successfully joined the club', club });
    } catch (error) {
      console.error('Join club error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async leaveClub(req, res) {
    try {
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is a member
      const memberIndex = club.members.findIndex(
        member => member.user.toString() === req.user._id.toString()
      );

      if (memberIndex === -1) {
        return res.status(400).json({ message: 'Not a member of this club' });
      }

      // Remove from members array
      club.members.splice(memberIndex, 1);
      await club.save();

      // Remove club from user's clubs array
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { clubs: club._id }
      });

      // Emit real-time update
      global.io.emit('club-member-left', { clubId: club._id, userId: req.user._id });

      res.json({ message: 'Successfully left the club' });
    } catch (error) {
      console.error('Leave club error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getUserClubs(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const user = await User.findById(req.user._id).populate('clubs');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const clubs = user.clubs || [];

      res.json({
        clubs,
        total: clubs.length,
        totalPages: 1,
        currentPage: 1
      });
    } catch (error) {
      console.error('Get user clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateMemberRole(req, res) {
    try {
      const { clubId, memberId } = req.params;
      const { role } = req.body;

      const club = await Club.findById(clubId);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is advisor, president, or admin
      const isAdvisor = club.advisor.toString() === req.user._id.toString();
      const isPresident = club.president && club.president.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isAdvisor && !isPresident && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Find and update member role
      const member = club.members.find(
        m => m.user.toString() === memberId
      );

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      member.role = role;
      await club.save();
      await club.populate('members.user', 'firstName lastName email');

      // Emit real-time update
      global.io.emit('club-member-role-updated', { clubId, memberId, role });

      res.json({ message: 'Member role updated successfully', club });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async approveClub(req, res) {
    try {
      const club = await Club.findById(req.params.id)
        .populate('advisor', 'firstName lastName email');

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is admin
      if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Access denied' });
      }

      club.isApproved = true;
      club.approvedBy = req.user._id;
      club.approvedAt = new Date();
      await club.save();

      // Notify club creator
      await notifyClubCreator(
        club,
        'approved',
        `${req.user.firstName} ${req.user.lastName}`
      );

      // Emit real-time update
      global.io.emit('club-approved', club);

      res.json({ message: 'Club approved successfully', club });
    } catch (error) {
      console.error('Approve club error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async rejectClub(req, res) {
    try {
      const club = await Club.findById(req.params.id)
        .populate('advisor', 'firstName lastName email');

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is admin
      if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Notify club creator before deletion
      await notifyClubCreator(
        club,
        'rejected',
        `${req.user.firstName} ${req.user.lastName}`
      );

      await Club.findByIdAndDelete(req.params.id);

      // Emit real-time update
      global.io.emit('club-rejected', { clubId: req.params.id });

      res.json({ message: 'Club rejected and removed' });
    } catch (error) {
      console.error('Reject club error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getPendingClubs(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Check if user is admin
      if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const clubs = await paginateResults(
        Club.find({ isApproved: false, isActive: true })
          .populate('advisor', 'firstName lastName email department')
          .sort({ createdAt: -1 }),
        page,
        limit
      );

      const total = await Club.countDocuments({ isApproved: false, isActive: true });

      res.json({
        clubs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get pending clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ClubsController();
