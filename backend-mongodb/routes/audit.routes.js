const express = require('express');
const { authenticate } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get audit logs
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      resourceType, 
      status,
      search 
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }

    // Apply filters
    if (action && action !== 'All Actions') {
      query.action = action;
    }

    if (resourceType && resourceType !== 'All Resources') {
      query.resourceType = resourceType;
    }

    if (status && status !== 'All Status') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { resourceType: { $regex: search, $options: 'i' } }
      ];
    }

    const auditLogs = await AuditLog.find(query)
      .populate('user', 'firstName lastName fullName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    // Format the response to match frontend expectations
    const formattedLogs = auditLogs.map(log => ({
      id: log._id,
      action: log.action,
      resource: log.details || log.resourceType,
      resourceType: log.resourceType,
      user: log.user ? (log.user.fullName || `${log.user.firstName} ${log.user.lastName}`) : 'System',
      role: log.user ? log.user.role : 'System',
      timestamp: log.createdAt.toLocaleString(),
      ip: log.ipAddress || 'N/A',
      status: 'success' // Default status, can be enhanced based on action type
    }));

    res.json({
      success: true,
      data: {
        auditLogs: formattedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get audit statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }

    const totalEvents = await AuditLog.countDocuments(query);
    
    // Get events by action type
    const actionStats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          action: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get recent events (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentEvents = await AuditLog.countDocuments({
      ...query,
      createdAt: { $gte: yesterday }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalEvents,
          recentEvents,
          actionStats
        }
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;