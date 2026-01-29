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
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const workflows = await Workflow.find(query)
      .populate('createdBy', 'firstName lastName fullName email')
      .populate('document', 'title type')
      .populate('steps.assignedTo', 'firstName lastName fullName email')
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
    const { name, description, status, steps } = req.body;

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

    if (status === 'completed') {
      workflow.completedAt = new Date();
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
      details: `Workflow updated: ${workflow.name}`,
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