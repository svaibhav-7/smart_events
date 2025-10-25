const User = require('../models/User');
const { generateToken, validateEmail } = require('../utils/helpers');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthController {
  async register(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role,
        studentId,
        employeeId,
        department,
        year,
        phone
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Validate role-specific fields
      if (role === 'student') {
        if (!studentId) {
          return res.status(400).json({ message: 'Student ID is required for students' });
        }
        if (!year) {
          return res.status(400).json({ message: 'Year is required for students' });
        }
      } else if (role === 'faculty' || role === 'admin') {
        if (!employeeId) {
          return res.status(400).json({ message: 'Employee ID is required for faculty and admin' });
        }
      }

      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role,
        studentId,
        employeeId,
        department,
        year,
        phone
      });

      await user.save();

      // Generate email verification token (implement email sending later)
      const emailToken = generateToken(user._id);

      // TODO: Send verification email

      const token = generateToken(user._id);
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          year: user.year,
          profilePicture: user.profilePicture,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id);
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone, department } = req.body;
      const userId = req.user._id;

      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;
      if (department) updateData.department = department;

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is typically handled on the client side
      // by removing the token. For server-side logout, you might want to implement
      // a token blacklist or short-lived tokens.
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, department, search } = req.query;
      let query = {};

      if (role) query.role = role;
      if (department) query.department = department;
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      res.json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { isActive } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User status updated successfully', user });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateFcmToken(req, res) {
    try {
      const { fcmToken } = req.body;
      await User.findByIdAndUpdate(req.user._id, { fcmToken });
      res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
      console.error('Update FCM token error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // TODO: Send reset email

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isEmailVerified = true;
      await user.save();

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(400).json({ message: 'Invalid verification token' });
    }
  }
}

module.exports = new AuthController();
