const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['contract', 'report', 'memo', 'policy', 'form', 'other']
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'archived'],
    default: 'draft'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  fileType: {
    type: String,
    default: null
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
documentSchema.index({ owner: 1, status: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);