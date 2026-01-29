const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    documentUpdates: { type: Boolean, default: true },
    workflowUpdates: { type: Boolean, default: true },
    caseFileUpdates: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  },
  preferences: {
    theme: { type: String, default: 'system', enum: ['light', 'dark', 'system'] },
    language: { type: String, default: 'en', enum: ['en', 'es', 'fr'] },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MM/DD/YYYY', enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
    itemsPerPage: { type: Number, default: 10, enum: [5, 10, 25, 50] },
    autoSave: { type: Boolean, default: true }
  },
  // Add claveUnicaId field to handle existing index
  claveUnicaId: {
    type: String,
    default: null,
    sparse: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  // Ensure all fields are properly serialized
  return {
    _id: userObject._id,
    email: userObject.email,
    firstName: userObject.firstName,
    lastName: userObject.lastName,
    fullName: userObject.fullName,
    role: userObject.role,
    department: userObject.department,
    position: userObject.position,
    avatar: userObject.avatar,
    isActive: userObject.isActive,
    lastLogin: userObject.lastLogin,
    notificationSettings: userObject.notificationSettings,
    preferences: userObject.preferences,
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);