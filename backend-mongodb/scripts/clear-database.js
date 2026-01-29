const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Document = require('../models/Document');
const Workflow = require('../models/Workflow');
const CaseFile = require('../models/CaseFile');
const AuditLog = require('../models/AuditLog');

async function clearDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Starting database cleanup...');

    // Clear all collections
    await User.deleteMany({});
    console.log('✅ Cleared users collection');

    await Document.deleteMany({});
    console.log('✅ Cleared documents collection');

    await Workflow.deleteMany({});
    console.log('✅ Cleared workflows collection');

    await CaseFile.deleteMany({});
    console.log('✅ Cleared case files collection');

    await AuditLog.deleteMany({});
    console.log('✅ Cleared audit logs collection');

    console.log('🎉 Database cleared successfully!');
    console.log('📊 All collections are now empty and ready for fresh data.');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

clearDatabase();