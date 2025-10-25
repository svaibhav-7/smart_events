const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'administrative', 'emergency', 'event', 'maintenance', 'other'],
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'staff', 'specific-department', 'specific-year'],
    default: 'all'
  },
  targetDepartment: {
    type: String,
    required: function() {
      return this.targetAudience === 'specific-department';
    }
  },
  targetYear: {
    type: String,
    required: function() {
      return this.targetAudience === 'specific-year';
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve all announcements
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  attachments: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
announcementSchema.index({ isActive: 1, expiresAt: 1, createdAt: -1 });
announcementSchema.index({ category: 1, priority: 1 });
announcementSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
