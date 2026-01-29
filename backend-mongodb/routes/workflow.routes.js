const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all workflows
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }
    
    // Handle status filtering including exclusion
    if (status) {
      query.status = status;
    } else if (req.query['status[ne]']) {
      query.status = { $ne: req.query['status[ne]'] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const workflows = await Workflow.find(query)
      .populate('createdBy', 'firstName lastName fullName')
      .populate('document', 'title type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Workflow.countDocuments(query);

    res.json({
      success: true,
      data: {
        workflows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflows',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get workflow by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('createdBy', 'firstName lastName fullName email')
      .populate('document', 'title type')
      .populate('steps.assignedTo', 'firstName lastName fullName email');

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && workflow.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { workflow }
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new workflow
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, document, steps } = req.body;

    const workflow = new Workflow({
      name,
      description,
      document: document || null,
      createdBy: req.user._id,
      steps: steps || []
    });

    await workflow.save();
    await workflow.populate([
      { path: 'createdBy', select: 'firstName lastName fullName email' },
      { path: 'document', select: 'title type' },
      { path: 'steps.assignedTo', select: 'firstName lastName fullName email' }
    ]);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'workflow',
      resourceId: workflow._id.toString(),
      details: `Workflow created: ${name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: { workflow }
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workflow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update workflow
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, status, steps, progress } = req.body;

    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && workflow.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update fields
    if (name) workflow.name = name;
    if (description) workflow.description = description;
    if (status) workflow.status = status;
    if (steps) workflow.steps = steps;
    if (progress !== undefined) workflow.progress = progress;

    // Auto-update status based on progress
    if (progress !== undefined) {
      if (progress === 100) {
        workflow.status = 'completed';
        workflow.completedAt = new Date();
      } else if (progress > 25) {
        workflow.status = 'in-progress';
      } else {
        workflow.status = 'pending';
      }
    }

    if (status === 'completed') {
      workflow.completedAt = new Date();
      workflow.progress = 100;
    }

    await workflow.save();
    await workflow.populate([
      { path: 'createdBy', select: 'firstName lastName fullName email' },
      { path: 'document', select: 'title type' },
      { path: 'steps.assignedTo', select: 'firstName lastName fullName email' }
    ]);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'workflow',
      resourceId: workflow._id.toString(),
      details: `Workflow updated: ${workflow.name} (Progress: ${workflow.progress}%)`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Workflow updated successfully',
      data: { workflow }
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workflow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Advance workflow progress
router.put('/:id/advance', authenticate, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && workflow.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate next progress step
    let nextProgress = workflow.progress;
    if (workflow.progress < 25) nextProgress = 25;
    else if (workflow.progress < 50) nextProgress = 50;
    else if (workflow.progress < 75) nextProgress = 75;
    else if (workflow.progress < 100) nextProgress = 100;

    workflow.progress = nextProgress;

    // Update status based on progress
    if (nextProgress === 100) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
    } else if (nextProgress > 25) {
      workflow.status = 'in-progress';
    } else {
      workflow.status = 'pending';
    }

    await workflow.save();
    await workflow.populate([
      { path: 'createdBy', select: 'firstName lastName fullName email' },
      { path: 'document', select: 'title type' },
      { path: 'steps.assignedTo', select: 'firstName lastName fullName email' }
    ]);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'advance',
      resourceType: 'workflow',
      resourceId: workflow._id.toString(),
      details: `Workflow advanced: ${workflow.name} to ${nextProgress}%`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Workflow advanced successfully',
      data: { workflow }
    });
  } catch (error) {
    console.error('Advance workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to advance workflow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Move workflow backward
router.put('/:id/backward', authenticate, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check permissions (only managers and admins can move backward)
    if (req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can move workflows backward'
      });
    }

    // Calculate previous progress step
    let prevProgress = workflow.progress;
    if (workflow.progress > 75) prevProgress = 75;
    else if (workflow.progress > 50) prevProgress = 50;
    else if (workflow.progress > 25) prevProgress = 25;
    else prevProgress = 25; // Minimum progress

    workflow.progress = prevProgress;

    // Update status based on progress
    if (prevProgress === 100) {
      workflow.status = 'completed';
    } else if (prevProgress > 25) {
      workflow.status = 'in-progress';
    } else {
      workflow.status = 'pending';
    }

    // Clear completion date if moving back from completed
    if (prevProgress < 100) {
      workflow.completedAt = null;
    }

    await workflow.save();
    await workflow.populate([
      { path: 'createdBy', select: 'firstName lastName fullName email' },
      { path: 'document', select: 'title type' },
      { path: 'steps.assignedTo', select: 'firstName lastName fullName email' }
    ]);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'backward',
      resourceType: 'workflow',
      resourceId: workflow._id.toString(),
      details: `Workflow moved backward: ${workflow.name} to ${prevProgress}%`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Workflow moved backward successfully',
      data: { workflow }
    });
  } catch (error) {
    console.error('Move workflow backward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move workflow backward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete workflow
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && workflow.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Workflow.findByIdAndDelete(req.params.id);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'workflow',
      resourceId: req.params.id,
      details: `Workflow deleted: ${workflow.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workflow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;