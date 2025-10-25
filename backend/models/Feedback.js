const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['suggestion', 'complaint', 'appreciation', 'bug-report', 'feature-request', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    enum: ['academic', 'administration', 'facilities', 'it', 'library', 'cafeteria', 'security', 'other'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  responses: [{
    response: {
      type: String,
      required: true
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Virtual for vote count
feedbackSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Index for better query performance
feedbackSchema.index({ status: 1, priority: 1, createdAt: -1 });
feedbackSchema.index({ department: 1, category: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
