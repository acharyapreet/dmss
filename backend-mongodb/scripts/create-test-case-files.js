const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const CaseFile = require('../models/CaseFile');
const User = require('../models/User');

async function createTestCaseFiles() {
  try {
    console.log('Creating test case files with different categories...');
    
    // Find a user to assign as owner
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      console.log('No admin user found, skipping case file creation');
      return;
    }
    
    const testCaseFiles = [
      {
        caseNumber: 'CF-2026-001',
        title: 'Zoning Variance Request',
        category: 'zoning',
        description: 'Request for zoning variance in residential area',
        owner: user._id,
        status: 'open'
      },
      {
        caseNumber: 'CF-2026-002',
        title: 'Building Permit Application',
        category: 'permits',
        description: 'Application for new building construction permit',
        owner: user._id,
        status: 'in-progress'
      },
      {
        caseNumber: 'CF-2026-003',
        title: 'Environmental Impact Study',
        category: 'environmental',
        description: 'Environmental assessment for new development',
        owner: user._id,
        status: 'open'
      },
      {
        caseNumber: 'CF-2026-004',
        title: 'Business License Application',
        category: 'licensing',
        description: 'New business license application',
        owner: user._id,
        status: 'closed'
      },
      {
        caseNumber: 'CF-2026-005',
        title: 'Road Maintenance Request',
        category: 'infrastructure',
        description: 'Request for road repair and maintenance',
        owner: user._id,
        status: 'open'
      },
      {
        caseNumber: 'CF-2026-006',
        title: 'Community Event Permit',
        category: 'events',
        description: 'Permit application for community festival',
        owner: user._id,
        status: 'in-progress'
      }
    ];
    
    for (const caseFileData of testCaseFiles) {
      const existingCaseFile = await CaseFile.findOne({ caseNumber: caseFileData.caseNumber });
      if (!existingCaseFile) {
        await CaseFile.create(caseFileData);
        console.log(`Created case file: ${caseFileData.title} (${caseFileData.category})`);
      } else {
        console.log(`Case file already exists: ${caseFileData.caseNumber}`);
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('Test case file creation completed');
  } catch (error) {
    console.error('Test case file creation failed:', error);
    process.exit(1);
  }
}

createTestCaseFiles();