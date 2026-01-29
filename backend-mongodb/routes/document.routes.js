const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all documents
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;
    
    // Build query
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      query.owner = req.user._id;
    }
    // Managers and admins can see all documents, but for pending status they see all
    // For other statuses, they see all documents
    
    // Handle status filtering including exclusion
    if (status) {
      query.status = status;
    } else if (req.query['status[ne]']) {
      query.status = { $ne: req.query['status[ne]'] };
    }
    
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(query)
      .populate('owner', 'firstName lastName fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get document by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'firstName lastName fullName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && document.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new document
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, type } = req.body;

    const document = new Document({
      title,
      description,
      type,
      owner: req.user._id
    });

    await document.save();
    await document.populate('owner', 'firstName lastName fullName email');

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'document',
      resourceId: document._id.toString(),
      details: `Document created: ${title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update document
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, type, status } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update fields
    if (title) document.title = title;
    if (description) document.description = description;
    if (type) document.type = type;
    if (status) document.status = status;

    await document.save();
    await document.populate('owner', 'firstName lastName fullName email');

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'document',
      resourceId: document._id.toString(),
      details: `Document updated: ${document.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    if (req.user.role === 'user' && document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    // Log audit event
    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'document',
      resourceId: req.params.id,
      details: `Document deleted: ${document.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;