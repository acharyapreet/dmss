const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const CaseFile = require('../models/CaseFile');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all case files
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    // Build query
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      query.owner = req.user._id;
    }
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const caseFiles = await CaseFile.find(query)
      .populate('owner', 'firstName lastName fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CaseFile.countDocuments(query);

    res.json({
      success: true,
      data: {
        caseFiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get case files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get case files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get case file by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const caseFile = await CaseFile.findById(req.params.id)
      .populate('owner', 'firstName lastName fullName email');

    if (!caseFile) {
      return res.status(404).json({
        success: false,
        message: 'Case file not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && caseFile.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { caseFile }
    });
  } catch (error) {
    console.error('Get case file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get case file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new case file
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // Generate case number
    const count = await CaseFile.countDocuments();
    const caseNumber = `CF-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const caseFile = new CaseFile({
      caseNumber,
      title,
      description,
      category,
      priority: priority || 'normal',
      owner: req.user._id
    });

    await caseFile.save();
    await caseFile.populate('owner', 'firstName lastName fullName email');

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'case-file',
      resourceId: caseFile._id.toString(),
      details: `Case file created: ${title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Case file created successfully',
      data: { caseFile }
    });
  } catch (error) {
    console.error('Create case file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create case file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update case file
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, category } = req.body;

    const caseFile = await CaseFile.findById(req.params.id);
    if (!caseFile) {
      return res.status(404).json({
        success: false,
        message: 'Case file not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && caseFile.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update fields
    if (title) caseFile.title = title;
    if (description) caseFile.description = description;
    if (status) caseFile.status = status;
    if (priority) caseFile.priority = priority;
    if (category) caseFile.category = category;

    if (status === 'closed') {
      caseFile.closedAt = new Date();
    }

    await caseFile.save();
    await caseFile.populate('owner', 'firstName lastName fullName email');

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'case-file',
      resourceId: caseFile._id.toString(),
      details: `Case file updated: ${caseFile.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Case file updated successfully',
      data: { caseFile }
    });
  } catch (error) {
    console.error('Update case file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete case file
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const caseFile = await CaseFile.findById(req.params.id);
    if (!caseFile) {
      return res.status(404).json({
        success: false,
        message: 'Case file not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && caseFile.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await CaseFile.findByIdAndDelete(req.params.id);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'case-file',
      resourceId: req.params.id,
      details: `Case file deleted: ${caseFile.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Case file deleted successfully'
    });
  } catch (error) {
    console.error('Delete case file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete case file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;