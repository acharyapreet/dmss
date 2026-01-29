const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['review', 'approval', 'signature', 'notification']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  comment: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'archived'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 25,
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: [workflowStepSchema],
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
workflowSchema.index({ createdBy: 1, status: 1 });
workflowSchema.index({ document: 1 });
workflowSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Workflow', workflowSchema);