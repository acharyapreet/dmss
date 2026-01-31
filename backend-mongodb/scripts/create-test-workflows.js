const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const Workflow = require('../models/Workflow');
const User = require('../models/User');

async function createTestWorkflows() {
  try {
    console.log('Creating test workflows with different templates...');
    
    // Find a user to assign as creator
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      console.log('No admin user found, skipping workflow creation');
      return;
    }
    
    const testWorkflows = [
      {
        name: 'Document Approval Test',
        description: 'Test workflow for document approval',
        template: 'document-approval',
        createdBy: user._id,
        status: 'pending'
      },
      {
        name: 'Contract Review Test',
        description: 'Test workflow for contract review',
        template: 'contract-review',
        createdBy: user._id,
        status: 'in-progress'
      },
      {
        name: 'Permit Request Test',
        description: 'Test workflow for permit request',
        template: 'permit-request',
        createdBy: user._id,
        status: 'pending'
      },
      {
        name: 'Internal Memo Test',
        description: 'Test workflow for internal memo',
        template: 'internal-memo',
        createdBy: user._id,
        status: 'completed'
      }
    ];
    
    for (const workflowData of testWorkflows) {
      const existingWorkflow = await Workflow.findOne({ name: workflowData.name });
      if (!existingWorkflow) {
        await Workflow.create(workflowData);
        console.log(`Created workflow: ${workflowData.name} (${workflowData.template})`);
      } else {
        console.log(`Workflow already exists: ${workflowData.name}`);
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('Test workflow creation completed');
  } catch (error) {
    console.error('Test workflow creation failed:', error);
    process.exit(1);
  }
}

createTestWorkflows();