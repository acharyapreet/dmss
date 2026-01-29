const express = require('express');
const { authenticate } = require('../middleware/auth');
const Document = require('../models/Document');
const Workflow = require('../models/Workflow');
const CaseFile = require('../models/CaseFile');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
// const cache = require('../utils/cache'); // Temporarily disabled

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // const cacheKey = `stats_${req.user.role}_${req.user._id}`;
    
    // Try to get from cache first
    // let stats = cache.get(cacheKey);
    let stats = null; // Temporarily disable cache
    
    if (!stats) {
      // Calculate stats if not in cache
      if (req.user.role === 'admin') {
        // Admin sees all statistics
        stats = {
          totalUsers: await User.countDocuments({ isActive: true }),
          totalDocuments: await Document.countDocuments(),
          totalWorkflows: await Workflow.countDocuments(),
          totalCaseFiles: await CaseFile.countDocuments(),
          pendingWorkflows: await Workflow.countDocuments({ status: 'pending' }),
          activeWorkflows: await Workflow.countDocuments({ status: 'in-progress' }),
          openCaseFiles: await CaseFile.countDocuments({ status: 'open' }),
          documentsThisMonth: await Document.countDocuments({
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          })
        };
      } else if (req.user.role === 'manager') {
        // Manager sees department statistics
        stats = {
          totalDocuments: await Document.countDocuments(),
          totalWorkflows: await Workflow.countDocuments(),
          totalCaseFiles: await CaseFile.countDocuments(),
          pendingWorkflows: await Workflow.countDocuments({ status: 'pending' }),
          activeWorkflows: await Workflow.countDocuments({ status: 'in-progress' }),
          openCaseFiles: await CaseFile.countDocuments({ status: 'open' }),
          myDocuments: await Document.countDocuments({ owner: req.user._id }),
          myWorkflows: await Workflow.countDocuments({ createdBy: req.user._id })
        };
      } else {
        // User sees only their own statistics
        stats = {
          myDocuments: await Document.countDocuments({ owner: req.user._id }),
          myWorkflows: await Workflow.countDocuments({ createdBy: req.user._id }),
          myCaseFiles: await CaseFile.countDocuments({ owner: req.user._id }),
          pendingWorkflows: await Workflow.countDocuments({ 
            createdBy: req.user._id, 
            status: 'pending' 
        }),
        activeWorkflows: await Workflow.countDocuments({ 
          createdBy: req.user._id, 
          status: 'in-progress' 
        }),
        documentsThisMonth: await Document.countDocuments({
          owner: req.user._id,
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        })
      };
    }
    
    // Cache the stats for 5 minutes
    // cache.set(cacheKey, stats); // Temporarily disabled
  }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recent activities
router.get('/activities', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }

    const activities = await AuditLog.find(query)
      .populate('user', 'firstName lastName fullName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recent users (admin only)
router.get('/users', authenticate, async (req, res) => {
  try {
    // Only admins can view user list
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { limit = 10 } = req.query;
    
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { users }
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

// Get document statistics by type
router.get('/document-stats', authenticate, async (req, res) => {
  try {
    let matchQuery = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      matchQuery.owner = req.user._id;
    }

    const documentStats = await Document.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: { documentStats }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get workflow statistics by status
router.get('/workflow-stats', authenticate, async (req, res) => {
  try {
    let matchQuery = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      matchQuery.createdBy = req.user._id;
    }

    const workflowStats = await Workflow.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: { workflowStats }
    });
  } catch (error) {
    console.error('Get workflow stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;