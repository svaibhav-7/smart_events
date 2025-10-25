const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: function() {
      return this.role === 'student' && this.authProvider === 'local';
    },
    unique: true,
    sparse: true
  },
  employeeId: {
    type: String,
    required: function() {
      return (this.role === 'faculty' || this.role === 'admin') && this.authProvider === 'local';
    },
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  department: {
    type: String,
    required: function() {
      return this.role !== 'admin' && this.authProvider === 'local';
    }
  },
  year: {
    type: String,
    required: function() {
      return this.role === 'student' && this.authProvider === 'local';
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  fcmToken: {
    type: String,
    default: null // For push notifications
  },
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }]
}, {
  timestamps: true
});

// Hash password before saving (only for local auth users)
userSchema.pre('save', async function(next) {
  // Only hash password if it's a local auth user and password is modified
  if (this.authProvider !== 'local' || !this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method (only for local auth users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Google OAuth users don't have passwords to compare
  if (this.authProvider === 'google') {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.fcmToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
