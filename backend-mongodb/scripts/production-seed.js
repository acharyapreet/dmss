const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function productionSeed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Starting production seeding...');

    // Create admin user only
    const adminUser = new User({
      email: 'admin@villarrica.gov',
      firstName: 'System',
      lastName: 'Administrator',
      fullName: 'System Administrator',
      password: 'admin123', // Will be hashed automatically by the model
      role: 'admin',
      department: 'IT',
      position: 'System Administrator',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Created admin user: admin@villarrica.gov');

    // Log the initial setup
    await AuditLog.create({
      user: adminUser._id,
      action: 'system_setup',
      resourceType: 'system',
      details: 'Production system initialized',
      ipAddress: 'system',
      userAgent: 'production-seed'
    });

    console.log('✅ Created initial audit log');

    console.log('🎉 Production seeding completed successfully!');
    console.log('');
    console.log('📋 Admin Account Created:');
    console.log('👤 Email: admin@villarrica.gov');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

productionSeed();