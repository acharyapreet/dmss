const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  resourceType: {
    type: String,
    enum: ['user', 'document', 'workflow', 'case-file', 'auth', 'system', 'profile', 'notifications', 'preferences'],
    required: true
  },
  resourceId: {
    type: String,
    default: null
  },
  details: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Index for better query performance
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);