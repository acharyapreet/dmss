const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { firstName, lastName, fullName, email, role, department, position, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (position !== undefined) user.position = position;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: `User updated: ${user.email} by admin`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'user',
      resourceId: req.params.id,
      details: `User deleted: ${user.email} by admin`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create user (admin only) - Alternative to registration
router.post('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, firstName, lastName, password, role, department, position } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      password,
      role: role || 'user',
      department,
      position
    });

    await user.save();

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: `User created: ${email} by admin`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get system statistics (admin only)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      inactiveUsers: await User.countDocuments({ isActive: false }),
      adminUsers: await User.countDocuments({ role: 'admin' }),
      managerUsers: await User.countDocuments({ role: 'manager' }),
      regularUsers: await User.countDocuments({ role: 'user' }),
      usersThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;