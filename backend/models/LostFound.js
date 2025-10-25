const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
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
    enum: ['lost', 'found'],
    required: true
  },
  itemType: {
    type: String,
    enum: ['electronics', 'documents', 'clothing', 'accessories', 'books', 'keys', 'wallet', 'other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  dateLostOrFound: {
    type: Date,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    alternateContact: {
      type: String,
      trim: true
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email'
    }
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['open', 'claimed', 'resolved', 'expired', 'matched'],
    default: 'open'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostFound'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  reward: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
lostFoundSchema.index({ category: 1, status: 1, dateLostOrFound: -1 });
lostFoundSchema.index({ location: 1 });
lostFoundSchema.index({ itemType: 1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);
