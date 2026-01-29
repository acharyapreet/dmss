const mongoose = require('mongoose');

const caseFileSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed', 'archived'],
    default: 'open'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    trim: true
  },
  closedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
caseFileSchema.index({ owner: 1, status: 1 });
caseFileSchema.index({ priority: 1 });
caseFileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CaseFile', caseFileSchema);