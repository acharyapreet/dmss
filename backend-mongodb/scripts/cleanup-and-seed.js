const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Document = require('../models/Document');
const Workflow = require('../models/Workflow');
const CaseFile = require('../models/CaseFile');
const AuditLog = require('../models/AuditLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for cleanup and seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const cleanupDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');

    // Drop all collections to start fresh
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await mongoose.connection.db.dropCollection(collection.name);
    }

    console.log('✅ All collections dropped');

    // Recreate collections with proper indexes
    await User.createCollection();
    await Document.createCollection();
    await Workflow.createCollection();
    await CaseFile.createCollection();
    await AuditLog.createCollection();

    console.log('✅ Collections recreated with proper schemas');

  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create users
    const users = [
      {
        email: 'admin@villarrica.gov',
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        password: 'admin123',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator'
      },
      {
        email: 'manager@villarrica.gov',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        fullName: 'Maria Rodriguez',
        password: 'manager123',
        role: 'manager',
        department: 'Administration',
        position: 'Department Manager'
      },
      {
        email: 'user@villarrica.gov',
        firstName: 'Juan',
        lastName: 'Perez',
        fullName: 'Juan Perez',
        password: 'user123',
        role: 'user',
        department: 'Legal',
        position: 'Legal Assistant'
      },
      {
        email: 'clerk@villarrica.gov',
        firstName: 'Ana',
        lastName: 'Garcia',
        fullName: 'Ana Garcia',
        password: 'clerk123',
        role: 'user',
        department: 'Records',
        position: 'Records Clerk'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('✅ Created users');

    // Create documents
    const documents = [
      {
        title: 'Municipal Budget 2024',
        description: 'Annual budget proposal for the municipality',
        type: 'report',
        status: 'approved',
        owner: createdUsers[0]._id
      },
      {
        title: 'Construction Permit Application',
        description: 'Permit application for new residential building',
        type: 'form',
        status: 'review',
        owner: createdUsers[1]._id
      },
      {
        title: 'Environmental Impact Study',
        description: 'Study on the environmental impact of proposed development',
        type: 'report',
        status: 'draft',
        owner: createdUsers[2]._id
      },
      {
        title: 'Public Works Contract',
        description: 'Contract for road maintenance services',
        type: 'contract',
        status: 'approved',
        owner: createdUsers[1]._id
      },
      {
        title: 'Zoning Ordinance Update',
        description: 'Updated zoning regulations for commercial districts',
        type: 'policy',
        status: 'review',
        owner: createdUsers[0]._id
      }
    ];

    const createdDocuments = await Document.create(documents);
    console.log('✅ Created documents');

    // Create workflows
    const workflows = [
      {
        name: 'Document Review Process',
        description: 'Standard document review and approval workflow',
        document: createdDocuments[0]._id,
        status: 'completed',
        createdBy: createdUsers[1]._id,
        steps: [
          {
            stepNumber: 1,
            type: 'review',
            assignedTo: createdUsers[2]._id,
            status: 'completed',
            comment: 'Initial review completed',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            stepNumber: 2,
            type: 'approval',
            assignedTo: createdUsers[0]._id,
            status: 'completed',
            comment: 'Approved for publication',
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Permit Application Review',
        description: 'Review process for construction permits',
        document: createdDocuments[1]._id,
        status: 'in-progress',
        createdBy: createdUsers[1]._id,
        steps: [
          {
            stepNumber: 1,
            type: 'review',
            assignedTo: createdUsers[2]._id,
            status: 'completed',
            comment: 'Legal review completed',
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            stepNumber: 2,
            type: 'approval',
            assignedTo: createdUsers[0]._id,
            status: 'pending',
            comment: null,
            completedAt: null
          }
        ]
      },
      {
        name: 'Policy Update Workflow',
        description: 'Workflow for updating municipal policies',
        document: createdDocuments[4]._id,
        status: 'pending',
        createdBy: createdUsers[0]._id,
        steps: [
          {
            stepNumber: 1,
            type: 'review',
            assignedTo: createdUsers[1]._id,
            status: 'pending',
            comment: null,
            completedAt: null
          }
        ]
      }
    ];

    const createdWorkflows = await Workflow.create(workflows);
    console.log('✅ Created workflows');

    // Create case files
    const caseFiles = [
      {
        caseNumber: 'CASE-2024-001',
        title: 'Noise Complaint - Main Street',
        description: 'Complaint about excessive noise from construction site',
        status: 'open',
        owner: createdUsers[2]._id,
        priority: 'high',
        category: 'Public Safety'
      },
      {
        caseNumber: 'CASE-2024-002',
        title: 'Property Tax Appeal',
        description: 'Appeal for property tax assessment review',
        status: 'in-progress',
        owner: createdUsers[3]._id,
        priority: 'normal',
        category: 'Finance'
      },
      {
        caseNumber: 'CASE-2024-003',
        title: 'Business License Application',
        description: 'New restaurant license application',
        status: 'closed',
        owner: createdUsers[1]._id,
        priority: 'normal',
        category: 'Licensing',
        closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdCaseFiles = await CaseFile.create(caseFiles);
    console.log('✅ Created case files');

    // Create audit logs
    const auditLogs = [
      {
        user: createdUsers[0]._id,
        action: 'login',
        resourceType: 'auth',
        details: 'Admin user logged in',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success'
      },
      {
        user: createdUsers[1]._id,
        action: 'create',
        resourceType: 'document',
        resourceId: createdDocuments[1]._id.toString(),
        details: 'Created document: Construction Permit Application',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success'
      },
      {
        user: createdUsers[2]._id,
        action: 'update',
        resourceType: 'workflow',
        resourceId: createdWorkflows[0]._id.toString(),
        details: 'Updated workflow step status',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success'
      }
    ];

    await AuditLog.create(auditLogs);
    console.log('✅ Created audit logs');

    console.log('\n🎉 Database cleanup and seeding completed successfully!');
    console.log('\n📋 Demo Users Created:');
    console.log('👤 Admin: admin@villarrica.gov / admin123');
    console.log('👤 Manager: manager@villarrica.gov / manager123');
    console.log('👤 User: user@villarrica.gov / user123');
    console.log('👤 Clerk: clerk@villarrica.gov / clerk123');
    console.log('\n📊 Sample Data:');
    console.log(`📄 Documents: ${createdDocuments.length}`);
    console.log(`🔄 Workflows: ${createdWorkflows.length}`);
    console.log(`📁 Case Files: ${createdCaseFiles.length}`);
    console.log(`📝 Audit Logs: ${auditLogs.length}`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Run cleanup and seeding
const runCleanupAndSeed = async () => {
  try {
    await connectDB();
    await cleanupDatabase();
    await seedDatabase();
  } catch (error) {
    console.error('❌ Process failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

runCleanupAndSeed();