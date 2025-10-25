const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'volunteer', 'other'],
    required: true
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'vice-president', 'secretary', 'treasurer', 'committee-member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: null
  },
  meetingSchedule: {
    day: String,
    time: String,
    location: String
  },
  contactEmail: {
    type: String,
    trim: true
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  establishedYear: {
    type: Number,
    required: true
  },
  achievements: [{
    title: String,
    description: String,
    year: Number
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for checking if club is full
clubSchema.virtual('isFull').get(function() {
  return this.maxMembers && this.members.length >= this.maxMembers;
});

// Index for better query performance
clubSchema.index({ category: 1, isActive: 1 });
clubSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Club', clubSchema);
